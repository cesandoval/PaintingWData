var Model = require('../models'),
    connection = require('../sequelize.js'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    amqp = require('amqplib/callback_api');

// This file extracts the datalayer ids from the request object and saves it on
// the datalayerIds object. 
// The datalayer objects are all strings containing ids. Eg "3", "7" ...

module.exports.computeVoxels = function(req, res){
    var datalayerIds = [];
    var datalayerIdString = req.body.datalayerIds;
    req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
        if(datalayerId !== ""){
            datalayerIds.push(datalayerId);
        }
    });
    var q = 'layer_tasks'


    function bail(err) {
      console.error(err);
      process.exit(1);
    }

    // Publisher
    console.log("================================");
    function publisher(conn) {
      conn.createChannel(on_open);
      function on_open(err, ch) {
        if (err != null) bail(err);
        ch.assertQueue(q);
        ch.sendToQueue(q, new Buffer(JSON.stringify({'user' : {'id' : req.user.id}, 'body':{'voxelname' : req.body.voxelname, 'datalayerIds': req.body.datalayerIds}})));
      }
    }
    console.log("================================");
    amqp.connect('amqp://localhost', function(err, conn) {
      if (err != null) bail(err);
      publisher(conn);
    });

    res.send(datalayerIds);  
};

module.exports.show = function(req, res) {
     Model.Datafile.findAll({
            where : {
                userId : req.user.id,
            }
        }).then(function(datafiles){
            res.render('layers', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user});
        });
}

module.exports.showVoxels= function(req, res) {
     Model.Datavoxel.findAll({
            where : {
                userId : req.user.id,
            }
        }).then(function(datavoxels){
            res.render('voxels', {id: req.params.id, datavoxels : datavoxels, userSignedIn: req.isAuthenticated(), user: req.user});
        });
}



module.exports.startWorker = function(datalayerIds, req){
    console.log("");
    async.waterfall([
        async.apply(getBbox, datalayerIds, req),
        createDatavoxel,
        getNet,
        pushDataNet,
        stValue,
        parseGeoJSON,
        pushDatajson,
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
        Model.Datavoxel.findAll({
            where: {
                userId: req.user.id,
            }
        }).then(function(datavoxels){
            res.redirect(`/voxels/${req.user.id}`);
        });
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
    newDatavoxel.save().then(function(datavoxel){
        props.forEach(function(prop, index){
            prop.datavoxelId = datavoxel.id;
            var newDatafilevoxel = Model.Datafilevoxel.build();
            newDatafilevoxel.datavoxelId = datavoxel.id;
            newDatafilevoxel.datafileId = prop.datafileId;
            newDatafilevoxel.bbox = currBbox;
            newDatafilevoxel.save().then(function(datafilevoxel){

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

    // CHANGE LAYERNAME TO VOXELNAME/////
    // ++++++++++++-++++++++++------
    var voxelname = req.body.voxelname;
    var epsg = props[0].epsg;
    var datavoxelId = props[0].datavoxelId;
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

function stValue(props, req, callback) {
    console.log("=========================================");
    console.log(`in stValue`);
    console.log("\n\n\n");
    console.log(props[0])
    var resultsArr = [];
    async.each(props, function(prop, callback) {
        console.log("=========================================");
        
        var raw_query = "SELECT ST_AsGeoJSON(p.geometry), ST_Value(r.rast, 1, p.geometry) As rastervalue FROM public."
                    +'"Datanets"' + " AS p, public.dataraster AS r WHERE ST_Intersects(r.rast, p.geometry) AND p."
                    +'"datavoxelId"' + "=" +prop.datavoxelId+" AND r.datafileid="+ prop.datafileId +";"
        connection.query(raw_query).spread(function(results, metadata){
            resultsArr.push(results)
        })
    },
    function(){
         callback(null, resultsArr, props, req)
    });
      
}

function parseGeoJSON(results, props, req, callback) {
    console.log("=========================================");
    console.log(`in parseGeoJSON`);
    console.log("\n\n\n");
    console.log(results);

    var newDataJsons = [];
   
    results.forEach(function(result, index){
        var features = [];
        for (i = 0; i < result.length; i++){
            var currentResult = result[i],
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
            layername: props[index].layername,
            userId: req.user.id,
            datavoxelId: props[index].datavoxelId,
            datafileId: props[index].datafileId,
            epsg: props[index].epsg,
            geojson: geoJSON,
        }
        newDataJsons.push(newDataJSON)
    });



    
    console.log(newDataJsons);
    callback(null, newDataJsons, props, req);
}

function pushDatajson(geoJSON, props, req, callback) {
   async.each(props, function(prop, callback) {
        var newDataJSON = Model.Datajson.build();
        newDataJSON.layername = prop.layername;
        newDataJSON.datafileId = prop.datafileId;
        newDataJSON.epsg = prop.epsg;
        newDataJSON.datavoxelId = prop.datavoxelId;
        newDataJSON.geojson = geoJSON;
        newDataJSON.userId = req.user.id;
        newDataJSON.save().then(function(){
        console.log('new geojsonmmmmmmm');
        callback(null, 'New dataJSON added');
    }); 
    },
    function(){
        callback(null, 'New dataJSON added');
    }); 

   
}

