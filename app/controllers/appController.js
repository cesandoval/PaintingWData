var Model = require('../models/models.js'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require("shapefile"),
    async = require('async'),
    request = require('request');

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

    async.waterfall([
        loadData,
        queryLayerName,
        getEPSG,
    ], function (err, result) {
        var file = "./app/controllers/shp/cancer_pt_part.shp";

        var epsg = result[0],
            newName = result[1],
            reader = shapefile.reader(file, {'ignore-properties': false});
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
            var geom = record.geometry;
            if (geom != null){ 
                geom.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}}
            }

            var newDataLayer = {
                layername: newName,
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
                    console.log('All Items have been processed!!!!!!')
                }
            }
        }
    });

    function loadData(callback) {
        var file = "./app/controllers/shp/cancer_pt_part.shp";
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

                if (isNaN(isNumber)){
                    newName = prevName+'_1';
                    console.log('repeated layers!!!!')
                } else {
                    newName = prevName+'_'+isNumber+1;
                    console.log('repeated layers!!!! we must add a number to the count')
                }

            } else {
                newName = layerName;
            }
            callback(null, layer, newName);
        })
    }

    function getEPSG(layer, newName, callback) {
        var epsg;
        if (layer.srs.getAttrValue("AUTHORITY",1)==null){
            request('http://prj2epsg.org/search.json?terms='+layer.srs.toWKT(), 
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    epsg = JSON.parse(body)['codes'][0]['code'];
                    callback(null, [epsg, newName]);
                }
            })
        } else {
            epsg = layer.srs.getAttrValue("AUTHORITY",1);
            callback(null, [epsg, newName]);
        }        
    }

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
