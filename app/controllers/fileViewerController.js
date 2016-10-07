var Model = require('../models'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require("shapefile"),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    request = require('request');

module.exports.saveShapes = function(req, res) {
    // This will instead have to be the id of the file we just uploaded
    var id = 4; 
    var newEpsg = req.body.epsg,
        location = req.body.location,
        layerName = req.body.layername,
        description = req.body.description;
        // dataProp = req.body.sele

    async.waterfall([
        async.apply(loadData, id),
        queryRepeatedLayer,
        pushDataLayer,
    ], function (err, result) {
        console.log(result)
        res.redirect('/uploadViewer/4');
    });
}

function queryRepeatedLayer(file, layer, epsg, fields, callback) {
    Model.Datalayer.findAll({
        limit: 1,
        where: {
            layername: layer.name
        }
    }).then(function(datalayers){
        if (datalayers.length > 0) {
            Model.Datalayer.max('id', {
                where: {
                    layername: {$like: layer.name+"_%"}
                }
            }).then(function(maxId) {
                if (!isNaN(maxId)) {
                    Model.Datalayer.findById(maxId).then(function(repeatedLayer){
                        var oldName = repeatedLayer.dataValues.layername;
                        var n = oldName.lastIndexOf("_");
                        var newLayerIndex = parseInt(oldName.slice(n+1))+1;

                        console.log('repeated layers!!!! we must add a number to the count')
                        var newName = oldName.slice(0,n+1)+newLayerIndex;
                        callback(null, file, epsg, newName);                    
                    })
                } else {
                    var newName = layer.name+'_1';
                    console.log('repeated layers!!!!')
                    console.log(newName)
                    callback(null, file, epsg, newName);
                }
            })
        } else {
            var newName = layer.name;
            callback(null, file, epsg, newName);
        }
    })
}

function pushDataLayer(file, epsg, newName, callback) {
    // var fileNames = gdal.open(file).getFileList()
    var fileNames = fs.readdirSync(file);
    fileNames.forEach(function(fileName, i) {
        if (fileName.endsWith('.shp')) {
            var filePath = path.join(file, fileName);
            var reader = shapefile.reader(filePath, {'ignore-properties': false});
            reader.readHeader(shapeLoader);

            var cargo = async.cargo(function(tasks, callback) {
                Model.Datalayer.bulkCreate(tasks, { validate: true }).catch(function(errors) 
                {
                    console.log(errors);
                    req.flash('error', "whoa")
                }).then(function() { 
                    return Model.Datalayer.findAll();
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

                    /////////////////////////////////////////////////
                    // This should be the one picked by the user...... or not, 
                    // I can just pass it to the raster saver...
                    rasterVal = record.properties['AGG_AGE_GE']
                }

                var newDatalayer = {
                    layername: newName,
                    userId: 1,
                    epsg: epsg,
                    geometry: geom,
                    properties: record.properties,
                    rasterval: rasterVal
                }

                if (geom != null) {
                    cargo.push(newDatalayer, function(err) {
                        // some
                    });
                }

                if( record !== shapefile.end ) reader.readRecord( shapeLoader );
                if(record == shapefile.end) {
                    cargo.drain = function () {
                        console.log('All Items have been processed!!!!!!')
                        callback(null, [epsg, newName]);
                    }
                }
            }
        }
    });
}

module.exports.serveMapData = function(req, res) {
    async.waterfall([
        async.apply(loadData, req.params.id),
        getGeoJSON,
    ], function (err, result) {
        res.send({
            bBox : result[0], 
            geoJSON: result[1],
            centroid: result[2],
            fields : result[3],
            epsg: result[4]
        })
    });  
}


function loadData(id, callback) {
    Model.Datafile.findById(id).then(function(datafile){
        var filePath = datafile.location;
        var dataset = gdal.open(filePath);
        var layer = dataset.layers.get(0);
        var epsg = datafile.epsg;
        var fields = layer.fields.getNames();

        callback(null, filePath, layer, epsg, fields);
    } );
    
}

function getGeoJSON(file, layer, epsg, fields, callback) {
    var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);
    var jsonGeoms = [];
    layer.features.forEach(function(feature, i) {
        var geom = feature.getGeometry();
        geom.transformTo(d_srs);

        jsonGeoms.push(geom.toJSON());
    })
    var bBox = layer.getExtent().toPolygon();
    var centroid = bBox.centroid();

    bBox.transform(transformation);
    centroid.transform(transformation);
    callback(null, [bBox.toJSON(), jsonGeoms, centroid.toJSON(), fields, epsg])
}