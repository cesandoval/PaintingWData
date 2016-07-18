var Model = require('../models/models.js'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require("shapefile"),
    async = require('async'),
    request = require('request');

// var raw_query = 'SELECT g.layername FROM public.datalayer AS g'
// //, WHERE g.layername='+layer.name;
// connection.query(raw_query).spread(function(results, metadata){
//     console.log(11111111);
//     console.log(results[0]);
//     console.log(22222222);
//     console.log(metadata);
//     console.log(33333333);
// })

// var raw_query = 'SELECT pg_typeof(g.geometry) FROM public.datalayer AS g'

// connection.query(raw_query).spread(function(results, metadata){
//     console.log(11111111);
//     console.log(results[0]);
//     console.log(22222222);
//     console.log(metadata);
//     console.log(33333333);
// })

module.exports.show = function(req, res) {
    // var raw_query = 'SELECT ST_AsGeoJSON(p.geom), ST_Value(r.rast, 1, p.geom) As rastervalue FROM public.cancer_pts AS p, public.cancer_raster2 AS r WHERE ST_Intersects(r.rast,p.geom);'

    // connection.query(raw_query).spread(function(results, metadata){
    //     console.log(11111111);
    //     console.log(results[0]);
    //     console.log(22222222);
    //     console.log(metadata);
    //     console.log(33333333);
    // })

    // var dataset = gdal.open("./app/controllers/raster/cancer.tif");
    // console.log("number of bands: " + dataset.bands.count());
    // console.log("width: " + dataset.rasterSize.x);
    // console.log("height: " + dataset.rasterSize.y);
    // console.log("geotransform: " + dataset.geoTransform);
    // console.log("srs: " + (dataset.srs ? dataset.srs.toWKT() : 'null'));

    // var file = "./app/controllers/shp/cancer_pt3.shp";
    var file = "./app/controllers/shp/cancer_pt_part.shp";
    
    var dataset = gdal.open(file);
    var layer = dataset.layers.get(0);
    var epsg;

    var nraw_query = "SELECT exists (SELECT 1 FROM public.datalayer AS g WHERE g.layername = '"+layer.name+"' LIMIT 1);"
    connection.query(nraw_query).spread(function(results, metadata){
        console.log(11111111);
        console.log(results);
        console.log(22222222);
        console.log(metadata);
        console.log(33333333);
    })//

    // console.log("fields: " + layer.fields.getNames());
    // console.log('type :' + layer.geomType )

    // TODO
    // if name is in db add a different one

    var reader = shapefile.reader(file, {'ignore-properties': false});
    var testing = getLayerName(layer.name);
    console.log(8585849833838383)
    console.log(testing)
    
    
    if (layer.srs.getAttrValue("AUTHORITY",1)==null){
        request('http://prj2epsg.org/search.json?terms='+layer.srs.toWKT(), 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                epsg = JSON.parse(body)['codes'][0]['code'];  
                
                // console.log(getLayerName(layer.name))
                // reader.readHeader(shapeLoader);
            }
        })
    } else {
        epsg = layer.srs.getAttrValue("AUTHORITY",1);
        // reader.readHeader(shapeLoader);
    }

    function getLayerName(layerName){
        Model.DataLayer.findAll(
        {
        where: { layername: layerName }
        }
        ).then(function(datalayers){
            var newName;
            if (datalayers.length != 0) {
                var prevName = datalayers[0].dataValues.layername;
                    isNumber = prevName.slice(-1).value;

                if (isNaN(isNumber)){
                    var newName = prevName+'_1';
                    // console.log(33333333)
                    // console.log(newName)
                    console.log('repeated layers!!!!')
                } else {
                    var newName = prevName+'_'+isNumber+1;
                    console.log('we must add a number to the count')
                }
            } else {
                var newName = layerName;
            }
            console.log(newName);
            // return newName;
        })
    }

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
        var geom = record.geometry;
        if (geom != null){ 
            geom.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}}
        }

        var newDataLayer = {
            layername: layer.name,
            userId: 1,
            epsg: epsg,
            geometry: geom,
            properties: JSON.stringify(record.properties)
        }
        cargo.push(newDataLayer, function(err) {
            // some
        });

        if( record !== shapefile.end ) reader.readRecord( shapeLoader );
        if(record == shapefile.end) {
            cargo.drain = function () {
                console.log('All Items have been processed!')
            }
        }
    }
    // reader.close();
    // TODO: Add spatial index
    res.render('app')
}

// Model.DataLayer.findAll(
// {
// // where: { username: 'a' }
// }
// ).then(function(datalayers){
//     console.log('controller queries')
//     console.log(datalayers)
//     console.log('adding and returning users')
// })
