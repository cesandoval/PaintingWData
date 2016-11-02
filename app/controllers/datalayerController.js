var Model = require('../models'),
    connection = require('../sequelize.js'),
    async = require('async'),
    path = require('path'),
    request = require('request');

// async.waterfall([
//     stValue,
//     parseGeoJSON
// ], function (err, result) {
//     Model.DataJSON.sync().then(function(){
//         return Model.DataJSON.create(result);
//     });
// });

// This file extracts the datalayer ids from the request object and saves it on
// the datalayerIds object. 
// The datalayer objects are all strings containing ids. Eg "3", "7" ...
module.exports.computeVoxels = function(req, res){
    var datalayerIds = [];
    req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
        if(datalayerId !== "")
            datalayerIds.push(datalayerId);
    });

     
    async.waterfall([
        async.apply(getBbox, datalayerIds, req),
        getNet,
        pushDataNet,
        stValue,
        parseGeoJSON,
    ], function (err, result) {
        console.log(444444444444444444444445555555555555555)
        console.log("\n\n\n");
        console.log(result[0]);
        console.log(result[1])
        console.log("\n\n\n");
        console.log("\n\n\n");
        console.log("\n\n\n");
        console.log("\n\n\n");
        console.log(444444444444444444444445555555555555555)
        console.log(444444444444444444444445555555555555555)

        var newDataJSON = Model.Datajson.build();
        newDataJSON.layername = result[1][0].layername;
        newDataJSON.datafileId = result[1][0].datafileId;
        newDataJSON.epsg = result[1][0].epsg;
        newDataJSON.geojson = result[0];
        newDataJSON.userId = req.user.id;
        newDataJSON.save().then(function(){
            console.log('new geojsonmmmmmmm')
        });   

    });

    res.send(datalayerIds);  
}

module.exports.show = function(req, res) {
     Model.Datafile.findAll({
            where : {
                userId : req.user.id,
            }
        }).then(function(datafiles){
            res.render('layers', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user});
        });
}

function getBbox(datalayerIds, req, callback) {
    var idsQuery = datalayerIds.toString();

    var distinctQuery = "SELECT DISTINCT "+'"datafileId", layername, epsg, "userLayerName"'+
                    " FROM public."+'"Datalayers"' + "AS p WHERE "
                    +'"datafileId"'+" in ("+idsQuery+");"; 
    
    // I NEED TO ADD A PROPERTY THAT DEALS WITH THE ACTUAL NAME OF THE PROPERTY USED. THIS WOULD BE SAVED FROM LAYERVIEWER
    // +++++++++++++++++----------------+++++++++++++++---------------+++++++++
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

function getNet(bbox, props, req, callback) {
    var epsg = props[0].epsg;
    // I NEED TO FIGURE OUT A WAY TO PICK THE STEPSIZE IN A BETTER WAY
    // +++++++++++++++++----------------+++++++++++++++---------------+++++++++
    var stepSize = 2000;

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
        callback(null, results[0], props, req);
    })
}

function pushDataNet(pointNet, props, req, callback) {
    // THIS HAS TO BE GIVEN BY THE USER/////
    // ++++++++++++-++++++++++------
    var layername = 'test_voxel';
    var epsg = props[0].epsg;
    var userId = req.user.id;

    console.log("=========================================");
    console.log(`in pushDataNet`);
    console.log("\n\n\n");
    var pointNet  = pointNet.point_net
    var maxLength = 1000;

    if (pointNet != null){ 
        pointNet.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}}
    }

    var cargo = async.cargo(function(tasks, callback) {
        Model.Datanet.bulkCreate(tasks, { validate: true }).catch(function(errors) 
        {
            console.log(errors);
            req.flash('error', "whoa")
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
            voxelname: layername,
            userId: userId,
            // datafileIds: '1,2,3,4',
            datavoxelId: 1, 
            epsg: epsg,
            geometry: point,
        }

        cargo.push(newDataNet, function(err) {
            // some
        });

        itemsProcessed++;
        console.log(itemsProcessed);

        if(itemsProcessed === pointNet.coordinates.length) {
            console.log('737327823874y2398476239846239846239846')
            callback(null, props, req);          
        }
    }
}


function stValue(pointNet, props, req, callback) {
    console.log("=========================================");
    console.log(`in stValue`);
    console.log("\n\n\n");

    var layername = props[0].layername;
    var datanetName = 'test_voxel'; 
    var fileId = props[0].datafileId;
    var epsg = props[0].epsg;
    var layerids = 1;

    var raw_query = "SELECT ST_AsGeoJSON(p.geometry), ST_Value(r.rast, 1, p.geometry) As rastervalue FROM public."
                    +'"Datanets"' + " AS p, public.dataraster AS r WHERE ST_Intersects(r.rast, p.geometry) AND p.layername='"
                    +datanetName+"' AND r.layername='"+layername+"';"


    connection.query(raw_query).spread(function(results, metadata){
        // parseGeoJSON(results, layername, epsg, layerids);
        callback(null, results, props, req)
    })
}

function parseGeoJSON(results, props, req, callback) {
    console.log("=========================================");
    console.log(`in parseGeoJSON`);
    console.log("\n\n\n");

    var layername = props[0].layername;
    var epsg = props[0].epsg;
    var layerids = 1;
    var userId = req.user.id;

    var features = [];
    for (i = 0; i < results.length; i++){
        var currentResult = results[i],
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
    // GET THE REAL VALS....
    var newDataJSON = {
        layername: layername,
        userId: userId,
        // datafileIds: '1, 5, 6',
        datavoxelId: 1,
        epsg: epsg,
        geojson: geoJSON,
    }

    callback(null, [newDataJSON, props, req]);
}
