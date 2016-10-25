var User = require('../models').User,
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require('shapefile'),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    exec = require('child_process').exec,
    formidable = require('formidable'),
    request = require('request');

function loadData(callback) {
    var file = "./app/controllers/shp/Riyadh_Neighborhoods.shp";
    var dataset = gdal.open(file);
    var layer = dataset.layers.get(0);
    callback(null, layer);
}

function queryLayerName(layer, callback) {
    var nraw_query = "SELECT exists (SELECT 1 FROM public.datalayer AS g WHERE g.layername = '"+layer.name+"' LIMIT 1);"
    connection.query(nraw_query).spread(function(results, metadata){
        var newName;
        var exists = results[0].exists;
        if (exists) {
            var prevName = layer.name;
                isNumber = prevName.slice(-1).value;

            var raw_query = "SELECT g.layername FROM public.datalayer AS g WHERE g.layername LIKE '"+prevName+"_%'"
            connection.query(raw_query).spread(function(results, metadata){
                if (results.length > 0) {
                    var hashedName = results[results.length-1].layername;
                    var n = hashedName.lastIndexOf("_");
                    var newLayerIndex = parseInt(hashedName.slice(n+1))+1;

                    console.log('repeated layers!!!! we must add a number to the count')
                    newName = hashedName.slice(0,n+1)+newLayerIndex;
                } else {
                    newName = prevName+'_1';
                    console.log('repeated layers!!!!')
                } 

                callback(null, layer, newName);
            });
        } else {
            newName = layer.name;
            callback(null, layer, newName);
        }            
    })
}

function getEPSG(layer, newName, callback) {
    var epsg;
    if (layer.srs.getAttrValue("AUTHORITY",1)==null){
        request('http://prj2epsg.org/search.json?terms='+layer.srs.toWKT(), 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                epsg = JSON.parse(body)['codes'][0]['code'];
                callback(null, epsg, newName);
            }
        })
    } else {
        epsg = layer.srs.getAttrValue("AUTHORITY",1);
        callback(null, epsg, newName);
    }        
}

function pushDataLayer(epsg, newName, callback) {
    var file = "./app/controllers/shp/Riyadh_Neighborhoods.shp";

    var reader = shapefile.reader(file, {'ignore-properties': false});
    
    reader.readHeader(shapeLoader);

    var cargo = async.cargo(function(tasks, callback) {
        Model.DataLayer.bulkCreate(tasks, { validate: true }).catch(function(errors) 
        {
            console.log(errors);
            req.flash('error', "whoa")
            // res.redirect('app')
        }).then(function() { 
            return Model.DataLayer.findAll();
        }).then(function(layers) {
            // console.log(layers) 
        }).then(function () {
            callback();
        })
    }, 1000);

    function shapeLoader( error, record ) {
        var geom = record.geometry,
            rasterVal = null;
        if (geom != null){ 
            geom.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}}
            rasterVal = record.properties['AGG_AGE_GE']
        }

        var newDataLayer = {
            layername: newName,
            userId: 1,
            epsg: epsg,
            geometry: geom,
            properties: record.properties,
            rasterval: rasterVal
            
        }

        if (geom != null) {
            cargo.push(newDataLayer, function(err) {
                // some
            });
        }

        if( record !== shapefile.end ) reader.readRecord( shapeLoader );
        if(record == shapefile.end) {
            cargo.drain = function () {
                console.log('All Items have been processed!!!!!!')
                callback(null, epsg, newName);
            }
        }
    }
}
/// kjskdj

function getBbox(epsg, newName, callback) {
    var layername = newName;
    
    var bboxQuery = "SELECT ST_SetSRID(ST_Extent(p.geometry),"+
                    epsg+") FROM public.datalayer AS p WHERE layername='"+layername+"';";
    connection.query(bboxQuery).spread(function(results, metadata){
        var bbox = results[0].st_setsrid
        callback(null, bbox, layername, epsg);
    })
}

function getNet(bbox, layername, epsg, callback) {
    console.log("=========================================");
    console.log(`in ${Function.name}`);
    console.log("\n\n\n");
    var stepSize = 700;

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
        callback(null, results[0], layername, epsg);//
    })
}

function pushDataNet(pointNet, layername, epsg, callback) {
    console.log("=========================================");
    console.log(`in pushDataNet`);
    console.log("\n\n\n");
    var pointNet  = pointNet.point_net
    var maxLength = 1000;
    // console.log(err);
    // console.log(pointNet.coordinates);

    if (pointNet != null){ 
        pointNet.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}}
    }

    var cargo = async.cargo(function(tasks, callback) {
        Model.DataNet.bulkCreate(tasks, { validate: true }).catch(function(errors) 
        {
            console.log(errors);
            req.flash('error', "whoa")
            // res.redirect('app')
        }).then(function() { 
            return Model.DataNet.findAll();
        }).then(function(layers) {
            // console.log(layers) 
        }).then(function () {
            callback();
        })
    }, maxLength);
        
    for (i = 0; i < pointNet.coordinates.length; i++){
        var point = {
            type: 'Point', 
            coordinates: pointNet.coordinates[i],
            crs: { type: 'name', properties: { name: 'EPSG:'+epsg} }
        }
        var newDataNet = {
            layername: layername,
            userId: 1,
            layerids: 1,
            epsg: epsg,
            geometry: point,
        }

        cargo.push(newDataNet, function(err) {
            // some
        });
    }
    callback(null, 'done');
}

function pushDataRaster(epsg, layername, callback) {
    console.log("=========================================");
    console.log(`in pushDataRaster`);
    console.log("\n\n\n");
    var tableQuery = 'CREATE TABLE IF NOT EXISTS public.dataraster (id serial primary key, rast raster, layername text);';

    var bboxQuery = tableQuery + 
                    "INSERT INTO public.dataraster (rast, layername) SELECT ST_SetSRID(St_asRaster(p.geometry, 500, 500, '32BF', rasterval, -999999), "+
                    epsg+"), p.layername FROM public.datalayer AS p WHERE layername='"+layername+"';";

    connection.query(bboxQuery).spread(function(results, metadata){
            console.log('Rasters Pushed!!!!')
            callback(null, epsg, layername)
        })
}


function stValue(callback) {
    console.log("=========================================");
    console.log(`in stValue`);
    console.log("\n\n\n");
    var layername = 'Risk_cancerresp_rep_part_11'
    var raw_query = "SELECT ST_AsGeoJSON(p.geometry), ST_Value(r.rast, 1, p.geometry) As rastervalue FROM public.datanet AS p, public.dataraster AS r WHERE ST_Intersects(r.rast, p.geometry) AND p.layername='"+layername+"' AND r.layername='"+layername+"';"
    var epsg = 2263;
        layerids = 1

    connection.query(raw_query).spread(function(results, metadata){
        // parseGeoJSON(results, layername, epsg, layerids);
        callback(null, results, layername, epsg, layerids)
    })
}


function parseGeoJSON(results, layername, epsg, layerids, callback) {
    console.log("=========================================");
    console.log(`in parseGeoJSON`);
    console.log("\n\n\n");
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

    var newDataJSON = {
        layername: layername,
        // userId: 1,
        epsg: epsg,
        geojson: geoJSON,
        layerids: layerids,
    }

    callback(null, newDataJSON);
}
module.exports = {
    getEPSG: getEPSG,
}
