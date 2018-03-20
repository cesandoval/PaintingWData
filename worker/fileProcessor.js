var async = require('async'),
    Model = require('../app/models/index'),
    connection = require('../app/sequelize'),
    mailer = require('../app/controllers/mailController');
    fileViewerHelper = require('../lib/fileViewerHelper');
    model = require('../app/models');
    fs_extra = require('fs-extra');

function startVoxelWorker(datalayerIds, req, callback){
    async.waterfall([
        async.apply(getBbox, datalayerIds, req),
        createDatavoxel,
        getNet,
        pushDataNet,
        cargoLoad,
        parseGeoJSON,
        pushDatajson,
    ], function (err, result) {
        var voxelId = result[0];
        Model.Datavoxel.findById(voxelId).then(function(datavoxel) {
            datavoxel.update({
                processed: true,
                rowsCols: result[1],
                allIndices: result[2],
                ptDistance: result[3]
            }).then(function(){
                Model.User.findById(result[4].user.id).then(function(user) {
                    //send user an email
                    mailer.sendVoxelEmail(user.email, user.id);
                }).then(function(){
                    callback({name: datavoxel.voxelname});
                })
            })
        })
    });
};

function startShapeWorker(req, callback) {
    var id = req.user.id;
    var newEpsg = req.body.epsg;
    var datafileId = req.body.datafileId;
    var location = req.body.location;
    var layerName = req.body.layername;
    var description = req.body.description;
    var dataProp = req.body.rasterProperty;
    console.log(id);

    async.waterfall([
        async.apply(fileViewerHelper.loadData, datafileId, req),
        fileViewerHelper.queryRepeatedLayer,
        fileViewerHelper.pushDataLayerTransform,
        // fileViewerHelper.pushDataRaster,
        function(file, thingsArray, callback){
            //   fs_extra.remove(file, err => {
            //       if (err) {
            //         console.log("Error cleaning local directory: ", file);
            //         console.log(err, err.stack);
            //         callback(err);
            //       }
            //       else{
            //          callback(null);
            //       }
            // })
            // console.log(file)
            // console.log(thingsArray)
            // callback(null);
        }
        // pushDataRaster
    ], function (err, result) {
        console.log(result)
        model.Datafile.find({
            where : {
                userId : req.user.id,
            }
        }).then(function(datafiles){

            if (req.user.id) {
                console.log(req.user.id);
            }
        });

    });
}

// This function creates a BBox around all the Datalayers selected
// It returns a bounding box, and a list of properties of each Datafile associated with the Datalayer
function getBbox(datalayerIds, req, callback) {
    var idsQuery = datalayerIds.toString();
    var distinctQuery = "SELECT DISTINCT "+'"datafileId", layername, epsg, "userLayerName"'+
        " FROM public."+'"Datalayers"' + "AS p WHERE "
        +'"datafileId"'+" in ("+idsQuery+");";

    connection.query(distinctQuery).spread(function(results, metadata){
        var epsg = 4326;
        var bboxQuery = "SELECT ST_SetSRID(ST_Extent(p.bbox),"+
            epsg+") FROM public."+'"Datafiles"' + " AS p WHERE "
            +'id'+" in ("+idsQuery+");";

        var props = results;
        connection.query(bboxQuery).spread(function(results, metadata){
            var bbox = results[0].st_setsrid
            callback(null, bbox, props, req);
        })
    })
}


function createDatavoxel(bbox, props, req, callback){
    var voxelname = req.body.voxelname;
    var currBbox = bbox;
    currBbox['crs'] = { type: 'name', properties: { name: 'EPSG:'+ 4326} };

    var newDatavoxel = Model.Datavoxel.build();
    newDatavoxel.voxelname = voxelname;
    newDatavoxel.epsg = 4326;
    newDatavoxel.userId = req.user.id;
    newDatavoxel.bbox = currBbox;
    newDatavoxel.processed = false;
    newDatavoxel.voxelId = req.voxelID;
    newDatavoxel.save().then(function(datavoxel){
        props.forEach(function(prop, index){
            prop.datavoxelId = datavoxel.id;

            var newDatafilevoxel = Model.Datafilevoxel.build();
            newDatafilevoxel.DatavoxelId = datavoxel.id;
            newDatafilevoxel.DatafileId = prop.datafileId;
            newDatafilevoxel.save().then(function(datafilevoxel){
                // console.log(datafilevoxel)
            });

        })
        callback(null, bbox, props, req);
    });
}

// This function creates a Datanet around the BBox that has been computed
// It returns the Datanet, and a list of properties of each Datafile associated with the Datanet
function getNet(bbox, props, req, callback) {
    var epsg = 4326;

    var numOfVoxels = req.body.voxelDensity;
    var coords = bbox.coordinates[0],
        length = Math.abs(coords[3][0]-coords[0][0])*1000000,
        width = Math.abs(coords[2][1]-coords[0][1])*1000000,
        area = length*width;
    var stepSize = Math.floor(Math.sqrt(area/numOfVoxels));

    var columns = Math.floor(length/stepSize),
        rows = Math.floor(width/stepSize);

    var netFunctionQuery = `
CREATE OR REPLACE FUNCTION st_polygrid(geometry, integer) RETURNS geometry AS
$$
SELECT
    ST_Collect(st_setsrid(ST_POINT(x/1000000::float,y/1000000::float),st_srid($1)))
FROM
  generate_series(floor(st_xmin($1)*1000000)::int, ceiling(st_xmax($1)*1000000)::int,$2) as x,
  generate_series(floor(st_ymin($1)*1000000)::int, ceiling(st_ymax($1)*1000000)::int,$2) as y
WHERE
    st_intersects($1,ST_SetSRID(ST_POINT(x/1000000::float,y/1000000::float),ST_SRID($1)))
$$
LANGUAGE sql VOLATILE;

SELECT
    st_polygrid(ST_SetSRID(ST_GeomFromGeoJSON('`+JSON.stringify(bbox)+`'),`+epsg+`), `+stepSize+`) AS point_net
`

    connection.query(netFunctionQuery).spread(function(results, metadata){
        // console.log(results[0])
        callback(null, results[0], props, req, columns, rows);
    })
}

function pushDataNet(pointNet, props, req, columns, rows, callback) {
    // CHANGE LAYERNAME TO VOXELNAME/////
    // ++++++++++++-++++++++++------
    var voxelname = req.body.voxelname;
    var epsg = 4326;
    var datavoxelId = props[0].datavoxelId;
    var userId = req.user.id;
    var pointNet  = pointNet.point_net
    var maxLength = 1000;
    var rowsCols = {rows: rows, cols: columns};

    if (pointNet != null){
        pointNet.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}}
    }

    var cargo = async.cargo(function(tasks, callback) {
        Model.Datanet.bulkCreate(tasks, { validate: true }).catch(function(errors)
        {
            console.log(errors);
            // req.flash('error', "whoa")
            // res.redirect('app')
        }).then(function () {
            callback();
        })
    }, maxLength);

    var itemsProcessed = 0;
    var firstItem = pointNet.coordinates[0]
    var secondItem = pointNet.coordinates[1]

    var xDiff = Math.abs(parseFloat(firstItem[0])-parseFloat(secondItem[0]));
    var yDiff = Math.abs(parseFloat(firstItem[1])-parseFloat(secondItem[1]));
    var ptDistance = Math.max(xDiff, yDiff)


    for (i = 0; i < pointNet.coordinates.length; i++){
        var point = {
            type: 'Point',
            coordinates: pointNet.coordinates[i],
            crs: { type: 'name', properties: { name: 'EPSG:'+epsg} }
        }
        var newDataNet = {
            voxelname: voxelname,
            userId: userId,
            datavoxelId: datavoxelId,
            epsg: epsg,
            geometry: point,
            neighborhood: {
                column: Math.floor(i/rows),
                row: i%rows
            },
            voxelIndex: i
        }

        cargo.push(newDataNet, function(err) {
            itemsProcessed++;

            if(itemsProcessed === pointNet.coordinates.length) {
                callback(null, props, req, rowsCols, ptDistance);
            }
        });


    }
}

function pointQuery(prop, callback){
    // rasterQuery2 = `
    // SELECT ST_Extent(p.geometry)
    // FROM public.` +'"Datanets"' + ` AS p
    // WHERE p.` +'"datavoxelId"' + "=" +prop.datavoxelId+`
    // ;`
    // connection.query(rasterQuery2).spread(function(results, metadata){
    //     console.log(results.length, 888888888)
    //     console.log(results)
    // });

    // rasterQuery3 = `
    // SELECT p.geometry
    // FROM public.` +'"Datalayers"' + ` AS p
    // WHERE p.`+'"datafileId"'+ "=" + prop.datafileId+`
    // ;`
    // connection.query(rasterQuery3).spread(function(results, metadata){
    //     console.log(results.length, 77777777)
    // });

    rasterQuery = `
    SELECT p.geometry, p.neighborhood, p.`+'"voxelIndex", ' + `g.`+'"rasterProperty", ' + `g.rasterval  As rastervalue
    FROM public.` +'"Datanets"' + " AS p, public."+'"Datalayers"' + ` AS g
    WHERE g.`+'"datafileId"'+ "=" + prop.datafileId +` AND p.` +'"datavoxelId"' + "=" +prop.datavoxelId+`
    AND ST_Within(p.geometry, g.geometry);`
    // 117, 45

    // rasterQuery = `
    // SELECT p.geometry as pt, CASE WHEN ST_Intersects(g.geometry, p.geometry) = TRUE THEN g.rasterval ELSE 0 end as pt_props
    // FROM public.` +'"Datanets"' + " AS p, public."+'"Datalayers"' + ` AS g
    // WHERE  p.` +'"datavoxelId"' + "=" +props[0].datavoxelId+`
    // AND g.`+'"datafileId"'+ "=" + props[0].datafileId +";"
    connection.query(rasterQuery).spread(function(results, metadata){
        console.log(results.length)
        callback(results);
    });
}

function stValue(prop, callback) {
    var raw_query = `
    SELECT p.geometry, p.neighborhood, p.`+'"voxelIndex", ' + 'r.layername, ' + `ST_Value(r.rast, 1, p.geometry) As rastervalue
    FROM public.`+'"Datanets"' + ` AS p, public.dataraster AS r
    WHERE ST_Intersects(r.rast, p.geometry) AND p.`+'"datavoxelId"' + "=" +prop.datavoxelId+" AND r.datafileid="+ prop.datafileId +";"
    console.log(raw_query)
    connection.query(raw_query).spread(function(results, metadata){
        console.log(results.length)
        // 2153, 1433, 3028
        callback(results);
    });

}

function cargoLoad(props, req, rowsCols, ptDistance, callback){
    console.log("props: ", props);
    var resultsObj ={};
    var objProps = {};
    var processedProps = 0;
    var cargo = async.cargo(function(tasks, callback) {
        for (var i=0; i<tasks.length; i++) {
            processedProps+=1;
            pointQuery(tasks[i], function(results){
                callback(results);
            });
        }

    }, 1);

    props.forEach(function(prop, index){
        cargo.push(prop, function(results){
            resultsObj[prop.datafileId] = results;
            objProps[prop.datafileId] = prop;
            if(processedProps == props.length){
                callback(null, resultsObj, objProps, req, rowsCols, ptDistance);
            }
        });
    });

}

function parseGeoJSON(results, objProps, req, rowsCols, ptDistance, callback) {
    for (var i; i<2000; i++){
        console.log(i, '++++++++++++++++++')
    }
    var allIndices = [];
    var currIndex = 0;

    var newDataJsons = {};
    var _keys = Object.keys(results);
    _keys.forEach(function(key, index){
        var layername = objProps[key].layername;
        var currGeojson = results[key];
        var features = [];
        for (i = 0; i <currGeojson.length; i++){
            var currentResult = currGeojson[i],
                voxel = {
                    type: 'Feature',
                    geometry: currentResult.geometry,
                    properties: { }
                };

            var index = currentResult.voxelIndex;
            if (allIndices.indexOf(index) === -1) {
                allIndices[currIndex] = index;
                currIndex +=1;
            }
            voxel['properties'][layername] = currentResult.rastervalue;
            voxel['properties']['neighborhood'] = currentResult.neighborhood;
            voxel['properties']['property'] = currentResult.rasterProperty;
            voxel['properties']['pointIndex'] = currentResult.voxelIndex;
            features.push(voxel);
        }

        var geoJSON = {
            type: "FeatureCollection",
            features: features
        }
        var newDataJSON = {
            layername: objProps[key].layername,
            userId: req.user.id,
            datavoxelId: objProps[key].datavoxelId,
            hashVoxelId: req.voxelID,
            datafileId: objProps[key].datafileId,
            epsg: 4326,
            geojson: geoJSON,
        }
        newDataJsons[key] = newDataJSON;
    });
    allIndices.sort(function(a, b){return parseInt(a)-parseInt(b)});

    callback(null, newDataJsons, objProps, req, rowsCols, allIndices, ptDistance);
}

function pushDatajson(dataJSONs, objProps, req, rowsCols, allIndices, ptDistance, callback) {
    var keys = Object.keys(objProps);
    var voxelId
    async.each(keys, function(key, callback) {
            var newDataJSON = Model.Datajson.build();
            const hashKey = (+new Date()).toString(32) + Math.floor(Math.random() * 36).toString(36)
            newDataJSON.layername = objProps[key].layername;
            newDataJSON.datafileId = objProps[key].datafileId;
            newDataJSON.epsg = 4326;
            newDataJSON.datavoxelId = objProps[key].datavoxelId;
            newDataJSON.geojson = dataJSONs[key];
            newDataJSON.hashVoxelId = req.voxelID;
            newDataJSON.userId = req.user.id;
            newDataJSON.layerKey = hashKey;
            newDataJSON.save().then(function(){
                callback(null, 'STOPPPPPPPP');
            });
            voxelId = objProps[key].datavoxelId;
        },
        function(){
            callback(null, [voxelId, rowsCols, allIndices, ptDistance, req]);
        });

}

module.exports.processDatalayer = startVoxelWorker;
module.exports.pushShapes = startShapeWorker;
