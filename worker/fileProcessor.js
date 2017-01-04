var async = require('async'),
    Model = require('../app/models/index'),
    connection = require('../app/sequelize');

function startWorker(datalayerIds, req, callback){
    async.waterfall([
        async.apply(getBbox, datalayerIds, req),
        createDatavoxel,
        getNet,
        pushDataNet,
        cargoLoad,
        parseGeoJSON,
        pushDatajson,
    ], function (err, result) {
        var voxelId = result;
        Model.Datavoxel.findById(voxelId).then(function(datavoxel) {
            datavoxel.update({
                processed: true
            }).then(function(){
                callback({name: datavoxel.voxelname});
            })
        })
    });
};

// This function creates a BBox around all the Datalayers selected
// It returns a bounding box, and a list of properties of each Datafile associated with the Datalayer
function getBbox(datalayerIds, req, callback) {
    var idsQuery = datalayerIds.toString();
    var distinctQuery = "SELECT DISTINCT "+'"datafileId", layername, epsg, "userLayerName"'+
        " FROM public."+'"Datalayers"' + "AS p WHERE "
        +'"datafileId"'+" in ("+idsQuery+");";

    connection.query(distinctQuery).spread(function(results, metadata){
        var epsg = results[0].epsg;
        var bboxQuery = "SELECT ST_SetSRID(ST_Extent(p.geometry),"+
            epsg+") FROM public."+'"Datalayers"' + " AS p WHERE "
            +'"datafileId"'+" in ("+idsQuery+");";

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
    currBbox['crs'] = { type: 'name', properties: { name: 'EPSG:'+ props[0].epsg} };

    var newDatavoxel = Model.Datavoxel.build();
    newDatavoxel.voxelname = voxelname;
    newDatavoxel.epsg = props[0].epsg;
    newDatavoxel.userId = req.user.id;
    newDatavoxel.bbox = currBbox;
    newDatavoxel.processed = false;
    newDatavoxel.save().then(function(datavoxel){
        props.forEach(function(prop, index){
            prop.datavoxelId = datavoxel.id;

            var newDatafilevoxel = Model.Datafilevoxel.build();
            newDatafilevoxel.DatavoxelId = datavoxel.id;
            newDatafilevoxel.DatafileId = prop.datafileId;
            newDatafilevoxel.save().then(function(datafilevoxel){
                console.log(datafilevoxel)
            });

        })
        callback(null, bbox, props, req);
    });
}

// This function creates a Datanet around the BBox that has been computed
// It returns the Datanet, and a list of properties of each Datafile associated with the Datanet
function getNet(bbox, props, req, callback) {
    var epsg = props[0].epsg;
    // I NEED TO FIGURE OUT A WAY TO PICK THE STEPSIZE IN A BETTER WAY
    // +++++++++++++++++----------------+++++++++++++++---------------+++++++++
    var stepSize = 1;

    var netFunctionQuery = `
CREATE OR REPLACE FUNCTION st_polygrid(geometry, integer) RETURNS geometry AS
$$
SELECT
    ST_SetSRID(ST_Collect(ST_POINT(x,y)), ST_SRID($1))
FROM
    generate_series(floor(ST_XMin($1))::numeric, ceiling(ST_xmax($1))::numeric, $2) as x,
    generate_series(floor(ST_ymin($1))::numeric, ceiling(ST_ymax($1))::numeric,$2) as y
WHERE
    ST_Intersects($1,ST_SetSRID(ST_POINT(x,y), ST_SRID($1)))
$$
LANGUAGE sql VOLATILE;

SELECT
    st_polygrid(ST_SetSRID(ST_GeomFromGeoJSON('`+JSON.stringify(bbox)+`'),`+epsg+`), `+stepSize+`) AS point_net
`

    connection.query(netFunctionQuery).spread(function(results, metadata){
        console.log(results[0])
        callback(null, results[0], props, req);
    })
}

function pushDataNet(pointNet, props, req, callback) {
    // CHANGE LAYERNAME TO VOXELNAME/////
    // ++++++++++++-++++++++++------
    var voxelname = req.body.voxelname;
    var epsg = props[0].epsg;
    var datavoxelId = props[0].datavoxelId;
    var userId = req.user.id;
    var pointNet  = pointNet.point_net
    var maxLength = 1000;

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
        }

        cargo.push(newDataNet, function(err) {
            itemsProcessed++;
            console.log(itemsProcessed);

            if(itemsProcessed === pointNet.coordinates.length) {
                callback(null, props, req);
            }
        });


    }
}

function stValue(prop, callback) {
    var raw_query = "SELECT ST_AsGeoJSON(p.geometry), ST_Value(r.rast, 1, p.geometry) As rastervalue FROM public."
        +'"Datanets"' + " AS p, public.dataraster AS r WHERE ST_Intersects(r.rast, p.geometry) AND p."
        +'"datavoxelId"' + "=" +prop.datavoxelId+" AND r.datafileid="+ prop.datafileId +";"
    connection.query(raw_query).spread(function(results, metadata){
        callback(results);
    });

}

function cargoLoad(props, req, callback){
    console.log("props: ", props);
    var resultsObj ={};
    var objProps = {};
    var processedProps = 0;
    var cargo = async.cargo(function(tasks, callback) {
        for (var i=0; i<tasks.length; i++) {
            processedProps+=1;
            stValue(tasks[i], function(results){

                callback(results);

            });
        }

    }, 1);

    props.forEach(function(prop, index){
        cargo.push(prop, function(results){
            resultsObj[prop.datafileId] = results;
            objProps[prop.datafileId] = prop;
            if(processedProps == props.length){
                callback(null, resultsObj, objProps, req);
            }
        });
    });

}

function parseGeoJSON(results, objProps, req, callback) {

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
                    geometry: currentResult.st_asgeojson,
                    properties: { }

                };

            voxel['properties'][layername] = currentResult.rastervalue;
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
            datafileId: objProps[key].datafileId,
            epsg: objProps[key].epsg,
            geojson: geoJSON,
        }
        newDataJsons[key] = newDataJSON;
    });

    console.log(newDataJsons);
    callback(null, newDataJsons, objProps, req);
}

function pushDatajson(dataJSONs, objProps, req, callback) {
    var keys = Object.keys(objProps);
    var voxelId
    async.each(keys, function(key, callback) {
            var newDataJSON = Model.Datajson.build();
            newDataJSON.layername = objProps[key].layername;
            newDataJSON.datafileId = objProps[key].datafileId;
            newDataJSON.epsg = objProps[key].epsg;
            newDataJSON.datavoxelId = objProps[key].datavoxelId;
            newDataJSON.geojson = dataJSONs[key];
            newDataJSON.userId = req.user.id;
            newDataJSON.save().then(function(){
                callback(null, 'STOPPPPPPPP');
            });
            voxelId = objProps[key].datavoxelId;
        },
        function(){
            callback(null, voxelId);
        });

}

module.exports.processDatalayer = startWorker;