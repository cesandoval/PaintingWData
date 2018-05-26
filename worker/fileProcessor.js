var async = require('async'),
    Model = require('../app/models/index'),
    connection = require('../app/sequelize'),
    mailer = require('../app/controllers/mailController');
    fileViewerHelper = require('../lib/fileViewerHelper');
    model = require('../app/models');
    fs_extra = require('fs-extra');

// function startVoxelWorker(datalayerIds, req, callback){
//     async.waterfall([
//         async.apply(getBbox, datalayerIds, req),
//         createDatavoxel,
//         getNet,
//         pushDataNet,
//         cargoLoad,
//         parseGeoJSON,
//         pushDatajson,
//     ], function (err, result) {
//         var voxelId = result[0];
//         Model.Datavoxel.findById(voxelId).then(function(datavoxel) {
//             datavoxel.update({
//                 processed: true,
//                 rowsCols: result[1], 
//                 allIndices: result[2], 
//                 ptDistance: result[3]
//             }).then(function(){
//                 Model.User.findById(result[4].user.id).then(function(user) {
//                     //send user an email
//                     mailer.sendVoxelEmail(user.email, user.id);
//                 }).then(function(){
//                     callback({name: datavoxel.voxelname});
//                 })    
//             })
//         })
//     });
// };

function startRasterVoxelWorker(datalayerIds, req, callback){
    console.log("datalayerIds: ", datalayerIds);
    console.log("req: ", req);
    console.log("datalayerIds (in startRasterVoxelWorker): ", datalayerIds);
    async.waterfall([
        async.apply(getBbox, datalayerIds, req),
        getDistance,
        createDatavoxel,
        createRaster,
        parseRasterGeoJSON,
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
                    // send user an email
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

    async.waterfall([
        async.apply(fileViewerHelper.loadData, datafileId, req),
        fileViewerHelper.queryRepeatedLayer,
        fileViewerHelper.pushDataLayerTransform,
        // function(file, thingsArray, callback){

        //     //   fs_extra.remove(file, err => {
        //     //       if (err) {
        //     //         console.log("Error cleaning local directory: ", file);
        //     //         console.log(err, err.stack);
        //     //         callback(err);
        //     //       }
        //     //       else{
        //     //          callback(null);
        //     //       }
        //     // })
        //     // console.log(file)
        //     // console.log(thingsArray)
        //     callback(null, []);         
        // },
        // pushDataRaster
    ], function (err, result) {
        // Send Layer complete user email
        Model.User.findById(req.user.id).then(function(user){
            mailer.sendLayerEmail(user.email ,req.user.id);
        },
        function(err){
            console.log(err)
        }
        );       
    });
}

// This function creates a BBox around all the Datalayers selected
// It returns a bounding box, and a list of properties of each Datafile associated with the Datalayer
function getBbox(datalayerIds, req, callback) {
    // var idsQuery = datalayerIds.toString();
    // console.log("idsQuery (in getBbox)", idsQuery);
    var datalayerIdsWithoutHash = [];
    for (var i = 0; i < datalayerIds.length; i++){
        var id = datalayerIds[i];
        datalayerIdsWithoutHash.push(id.split("..")[0]);
    }
    var idsQuery = datalayerIdsWithoutHash.toString();
    console.log("idsQuery (in getBbox)", idsQuery);

    var distinctQuery = "SELECT DISTINCT "+'"datafileId", layername, epsg, "userLayerName"'+ " FROM public."+'"Datalayers"' + "AS p WHERE " + '"datafileId"'+" in ("+idsQuery+");";

     var tableQuery = 'CREATE TABLE IF NOT EXISTS public."Datavoxelbbox" (id serial primary key, rast raster, voxelid character varying(255));';

    connection.query(distinctQuery + tableQuery).spread(function(results, metadata){
        var epsg = 4326;
        var bboxQuery = "SELECT ST_SetSRID(ST_Extent(p.bbox),"+ epsg+") FROM public."+'"Datafiles"' + " AS p WHERE "+'id'+" in ("+idsQuery+");";
        var props = results;

        var voxelId = (+new Date()).toString(32) +Math.floor(Math.random() * 36).toString(36)
        // Math.floor(Math.random()* 10000).toString();

        connection.query(bboxQuery).spread(function(results, metadata){
            var bbox = results[0].st_setsrid;
            rowsCols = getBboxRC(bbox, req);

            var bboxInsert = `INSERT INTO public."Datavoxelbbox" (rast, voxelid) VALUES(ST_SetSRID(ST_AsRaster(ST_GeomFromGeoJSON('` + JSON.stringify(bbox) + `'), ` + rowsCols.rows + `, ` +  rowsCols.cols + `, '32BF'), ` + epsg + `), '` + voxelId + `');`
            console.log("bbox query: \n \n " + bboxInsert);
            req.voxelRandomId = voxelId;

            connection.query(bboxInsert).spread(function(results, metadata){
                callback(null, bbox, props, req);
            })
        })
    })
}

function getDistance(bbox, props, req, callback) {
    var voxelId = req.voxelRandomId;
    var ptQuery = `(SELECT ST_PixelAsCentroid(r.rast, 1, 1) FROM public."Datavoxelbbox" AS r  WHERE r.voxelid= '` + voxelId + `') UNION ALL  (SELECT ST_PixelAsCentroid(p.rast, 1, 2) FROM public."Datavoxelbbox" AS p  WHERE p.voxelid= '` + voxelId + `')`

    connection.query(ptQuery).spread(function(results, metadata){
        var firstItem = results[0].st_pixelascentroid.coordinates
        var secondItem = results[1].st_pixelascentroid.coordinates

        var xDiff = Math.abs(parseFloat(firstItem[0])-parseFloat(secondItem[0]));
        var yDiff = Math.abs(parseFloat(firstItem[1])-parseFloat(secondItem[1]));
        var ptDistance = Math.max(xDiff, yDiff)

        req.ptDistance = ptDistance;
        callback(null, bbox, props, req);
    })
}

function getBboxRC(bbox, req) {
    var numOfVoxels = req.body.voxelDensity;

    var coords = bbox.coordinates[0],
        length = Math.abs(coords[3][0]-coords[0][0])*1000000,
        width = Math.abs(coords[2][1]-coords[0][1])*1000000,
        area = length*width; 
    var stepSize = Math.floor(Math.sqrt(area/numOfVoxels));
    var columns = Math.floor(length/stepSize),
        rows = Math.floor(width/stepSize);

    var rowsCols = {rows: rows, cols: columns};

    return rowsCols;
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
    newDatavoxel.public = false;
    newDatavoxel.save().then(function(datavoxel){
        props.forEach(function(prop, index){
            prop.datavoxelId = datavoxel.id;
            req.voxelId = datavoxel.id;

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

function createRaster(bbox, props, req, callback) {
    // save pixel data
    var resultsObj ={};
    var objProps = {};

    var rowsCols = getBboxRC(bbox, req);

    var ptDistance =  req.ptDistance;

    var maxLength = 1,
        processedProps = 0;

    // process layers
    var cargo = async.cargo(function(tasks, callback) {
        for (var i=0; i<tasks.length; i++) {
            processedProps+=1;
            saveRaster(tasks[i], rowsCols, bbox, req, function(results){
                callback(results);
            });
        }
    }, maxLength);

    props.forEach(function(prop, index){
        cargo.push(prop, function(results){
            // resultsObj holds points (geom, val, x, y)
            resultsObj[prop.datafileId] = results;
            objProps[prop.datafileId] = prop;
            if (processedProps == props.length){
                console.log("\n ------ finished raster creation ------\n");
                callback(null, resultsObj, objProps, req, rowsCols, ptDistance);
            }
        });
    });
}



function saveRaster(prop, rowsCols, bbox, req, callback) {
    var epsg = 4326;

    console.log("\n\n saving raster for " + prop.datafileId + "\n");
    var tableQuery = 'CREATE TABLE IF NOT EXISTS public."Datarasters" (id serial primary key, rast raster, layername text, datafileid integer, voxelid integer); ';
    var bboxSelect = `(SELECT b.rast FROM public."Datavoxelbbox" as b WHERE voxelid= '` + req.voxelRandomId + `')`;
    var rasterCreationQuery = `INSERT INTO public."Datarasters" (rast, layername, datafileid, voxelid) SELECT ST_Union(ST_SetSRID(ST_AsRaster(p.geometry, ` + bboxSelect + `, '32BF', p.rasterval, -999999), ` + epsg + `)), layername, ` + prop.datafileId + `, ` + req.voxelId + ` FROM public."Datalayers" AS p, public."Datafiles" AS g WHERE layername='`+ prop.layername +`' AND g.id=` + prop.datafileId + ` AND p."datafileId"=` + prop.datafileId +  ` GROUP BY p.layername; `;
    var mapAlgebraQuery = `ST_Resample(ST_SetSRID(r.rast, ` + epsg + `), b.rast)`;
    var centroidValueQuery = `SELECT (ST_PixelasCentroids(` + mapAlgebraQuery + `)).* FROM public."Datarasters" as r, public."Datavoxelbbox" as b WHERE r.datafileid=` + prop.datafileId + ` AND b.voxelid= '` + req.voxelRandomId + `'; `;

    var rasterQuery = tableQuery + rasterCreationQuery + centroidValueQuery;
    connection.query(rasterQuery).spread(function(results, metadata){
            callback(results);
        })
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
    rasterQuery = `
    SELECT p.geometry, p.neighborhood, p.`+'"voxelIndex", ' + `g.`+'"rasterProperty", ' + `g.rasterval  As rastervalue
    FROM public.` +'"Datanets"' + " AS p, public."+'"Datalayers"' + ` AS g 
    WHERE g.`+'"datafileId"'+ "=" + prop.datafileId +` AND p.` +'"datavoxelId"' + "=" +prop.datavoxelId +`
    AND ST_Within(p.geometry, g.geometry);`

    connection.query(rasterQuery).spread(function(results, metadata){
        console.log(results.length);
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

function parseRasterGeoJSON(results, objProps, req, rowsCols, ptDistance, callback) {
    // All indices might not be upating everytime, since it might not be recurssively passed to async.cargo
    var allIndices = [];
    var currIndex = 0;
    var newDataJsons = {};
    // var _keys = Object.keys(results);
    console.log("objProps: ", objProps);

    var maxLength = 1,
    processedProps = 0;

    // Process in the queue
    var cargo = async.cargo(function(tasks, callback) {
        for (var i=0; i<tasks.length; i++) {
            processedProps+=1;
            findRaster(tasks[i], results, objProps, req, rowsCols, ptDistance, allIndices, function(result) {
                callback(result);
            });
        }
    }, maxLength);

    // Add to queue and handle callback
    var _keys = Object.keys(req.body.datalayerIdsAndProps);
    console.log("_keys: ", _keys);    
    _keys.forEach(function(key, index){
        var keyAndIndex = {};
        keyAndIndex.key = key;
        keyAndIndex.index = index;
        cargo.push(keyAndIndex, function(currLayerResult){
            newDataJsons[key] = currLayerResult.newDataJSON;

            if (processedProps == _keys.length){
                allIndices.sort(function(a, b){return parseInt(a)-parseInt(b)});    
                callback(null, newDataJsons, objProps, req, rowsCols, allIndices, ptDistance);    
            }
        })

    }

)}

function findRaster(keyAndIndex, results, objProps, req, rowsCols, ptDistance, allIndices, callback){
    var key = keyAndIndex.key;
    var keyWithouHash = key.split("..")[0];

    var layername = objProps[keyWithouHash].layername;
    var currGeojson = results[keyWithouHash];
    var features = [];
    var currIndex = 0;

    // console.log("req.body.datalayerIdsAndProps: ", req.body.datalayerIdsAndProps);
    // console.log("key: ", key);
    // console.log(req.body.datalayerIdsAndProps[key]);
    // console.log(req.body.datalayerIdsAndProps[key].split(";"));

    // for (var singleProperty in req.datalayerIdsAndProps[key].split(";")) {
    //     console.log("***************");
    //     console.log(key, singleProperty);
    // }


    Model.Datadbf.findAll({
        where : {
            datafileId: objProps[keyWithouHash].datafileId,
        }
    }).then(function(datadbf) {

        
        var dataDbfObject = {};
        for (var i = 0; i < datadbf.length; i++){
            var userSelectedProperty = req.body.datalayerIdsAndProps[key]
            var props = JSON.parse(datadbf[i].properties);
            var propertyValue = props[userSelectedProperty]
            var datalayerId = datadbf[i].datalayerId
            dataDbfObject[datalayerId] = propertyValue;
        }
        // console.log("dataDbfObject: ", dataDbfObject);

        for (i = 0; i <currGeojson.length; i++){
            var currentResult = currGeojson[i],
                voxel = {
                    type: 'Feature',
                    geometry: currentResult.geom,
                    properties: { }
                };
            var index = currentResult.x + rowsCols.rows * currentResult.y;
            if (allIndices.indexOf(index) === -1) {
                allIndices[currIndex] = index;
                currIndex +=1;
            }

            // voxel['properties'][layername] = currentResult.val; //OLD vrsion
            voxel['properties'][layername] = dataDbfObject[currentResult.val]; //DATADBF.DATALAYYERID.PROPS.USERSELECTEDPROPERTY ex: ObjectId => 31
            // voxel['properties'][layername] = JSON.parse(Datadbf.get(datalayerid).properties)[userSelectedProperty];


            voxel['properties']['neighborhood'] = {
                column: currentResult.y,
                row: currentResult.x
            };
            // voxel['properties']['property'] = objProps[key].rasterProperty; //TODO: change this to the rasterprop user selects
            voxel['properties']['property'] = req.body.datalayerIdsAndProps[key];
            voxel['properties']['pointIndex'] = index;

            // console.log("voxel: " + JSON.stringify(voxel, null, 4));
            features.push(voxel);

            
        }
    
        var geoJSON = {
            type: "FeatureCollection",
            features: features
        }
        var newDataJSON = {
            layername: objProps[keyWithouHash].layername,
            userId: req.user.id,
            datavoxelId: objProps[keyWithouHash].datavoxelId,
            datafileId: objProps[keyWithouHash].datafileId,
            epsg: 4326,
            geojson: geoJSON,
        }
        callback({newDataJSON: newDataJSON, allIndices:allIndices});
     });

}

// function parseGeoJSON(results, objProps, req, rowsCols, ptDistance, callback) {
//     var allIndices = [];
//     var currIndex = 0;

//     var newDataJsons = {};
//     var _keys = Object.keys(results);
//     _keys.forEach(function(key, index){
//         var layername = objProps[key].layername;
//         var currGeojson = results[key];
//         var features = [];
//         for (i = 0; i <currGeojson.length; i++){
//             var currentResult = currGeojson[i],
//                 voxel = {
//                     type: 'Feature',
//                     geometry: currentResult.geometry,
//                     properties: { }
//                 };

//             var index = currentResult.voxelIndex;
//             if (allIndices.indexOf(index) === -1) {
//                 allIndices[currIndex] = index;
//                 currIndex +=1;
//             }
//             voxel['properties'][layername] = currentResult.rastervalue;
//             voxel['properties']['neighborhood'] = currentResult.neighborhood;
//             voxel['properties']['property'] = currentResult.rasterProperty;
//             voxel['properties']['pointIndex'] = currentResult.voxelIndex;

//             features.push(voxel);
//         }

//         var geoJSON = {
//             type: "FeatureCollection",
//             features: features
//         }
//         var newDataJSON = {
//             layername: objProps[key].layername,
//             userId: req.user.id,
//             datavoxelId: objProps[key].datavoxelId,
//             datafileId: objProps[key].datafileId,
//             epsg: 4326,
//             geojson: geoJSON,
//         }
//         newDataJsons[key] = newDataJSON;
//     });
//     allIndices.sort(function(a, b){return parseInt(a)-parseInt(b)});    
    
//     callback(null, newDataJsons, objProps, req, rowsCols, allIndices, ptDistance);
// }

function pushDatajson(dataJSONs, objProps, req, rowsCols, allIndices, ptDistance, callback) {
    // var keys = Object.keys(objProps);
    var keys = Object.keys(req.body.datalayerIdsAndProps);
    
    var voxelId
    async.each(keys, function(key, callback) {
            var keyWithouHash = key.split("..")[0];
            console.log("key (inside pushDatajson): ", key);

            var newDataJSON = Model.Datajson.build();
            const hashKey = (+new Date()).toString(32) + Math.floor(Math.random() * 36).toString(36)
            newDataJSON.layername = objProps[keyWithouHash].layername;
            newDataJSON.datafileId = objProps[keyWithouHash].datafileId;
            newDataJSON.epsg = 4326;
            newDataJSON.datavoxelId = objProps[keyWithouHash].datavoxelId;
            newDataJSON.geojson = dataJSONs[key];
            newDataJSON.hashVoxelId = req.voxelID;
            newDataJSON.userId = req.user.id;
            newDataJSON.layerKey = hashKey;
            newDataJSON.save().then(function(){
                callback(null, 'STOPPPPPPPP');
            });
            console.log("newDataJSON: ", newDataJSON);
            voxelId = objProps[keyWithouHash].datavoxelId;
        },
        function(){
            callback(null, [voxelId, rowsCols, allIndices, ptDistance, req]);
        });

}

module.exports.processDatalayer = startRasterVoxelWorker;
module.exports.pushShapes = startShapeWorker;
