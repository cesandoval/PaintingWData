var Model = require('../app/models'),
    connection = require('../app/sequelize.js'),
    gdal = require("gdal"), 
    shapefile = require("shapefile"), 
    async = require('async'),
    fs = require('fs'), 
    path = require('path'),
    meta = require('@turf/meta'),
    random = require('@turf/random'),
    interpolate = require('@turf/interpolate');

const cn = {
        host: 'localhost',
        database: 'PaintingWithData_Riyadh',
        user: 'postgres',
        password: 'postgrespass'
    };

const db = pgp(cn);

function queryRepeatedLayer(file, layer, epsg, fields, req, geomType, callback) {
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
                        callback(null, file, epsg, newName, req, layer, geomType);                    
                    })
                } else {
                    var newName = layer.name+'_1';
                    console.log('repeated layers!!!!')
                    console.log(newName)
                    callback(null, file, epsg, newName, req, layer, geomType);
                }
            })
        } else {
            var newName = layer.name;
            callback(null, file, epsg, newName, req, layer, geomType);
        }
    })
}

function pushDataLayerTransformViaPromise(file, epsg, newName, req, layer, callback) {
    var totalTime;
    var start = new Date;

    var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);

    var itemsProcessed = 0, 
        totalFeatues = layer.features.count();

    while (feature = layer.features.next()) {
        var geom = feature.getGeometry();
        geom.transformTo(d_srs);
        var geomJson = geom.toObject()

        var rasterVal = null;
        if (geom != null) { 
            geomJson.crs = { type: 'name', properties: { name: 'EPSG:'+4326}}

            var rasterProperty = req.body.rasterProperty;
            rasterVal = feature.fields.get(rasterProperty);

            db.none('INSERT INTO public."Datalayers" (layername, "userId", "datafileId", epsg, "userLayerName", geometry, description, location, properties, rasterval, "rasterProperty", "createdAt", "updatedAt") VALUES (${layername}, ${userId}, ${datafileId}, ${epsg}, ${userLayerName}, ST_GeomFromGeoJSON(${geometry}), ${description}, ${location}, ${properties}, ${rasterval}, ${rasterProperty}, current_timestamp, current_timestamp)',
            {
                layername: newName,
                userId: req.user.id,
                datafileId: req.body.datafileId,
                epsg: epsg,
                userLayerName: req.body.layername,
                geometry: JSON.stringify(geomJson),
                description: req.body.description,
                location: req.body.location,
                properties: JSON.stringify(feature.fields.toObject()),
                rasterval: rasterVal, 
                rasterProperty: rasterProperty
            })
                .then(() => {
                    // success, all records inserted
                })
                .catch(error => {
                    // error
                    console.log('DB ERROR:', error);
                });

        }
    }

    totalTime = new Date - start;
    console.log('Took', totalTime, 'milliseconds to generate the upload-----------------------');
}


function pushDataLayerTransform(file, epsg, newName, req, layer, geomType, callback) {
    console.log('--------------',geomType, '------------')
    var totalTime;
    var start = new Date;

    var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);

    var itemsProcessed = 0, 
        totalFeatues = layer.features.count();

    // Figure out if geometry is a Point
    var isPoint = geomType.includes('Point');
    if (isPoint) {
        var transformedPts = transformPoints(layer, d_srs, req.body.rasterProperty);
        processPoints(transformedPts);
    }
        
    while(feature = layer.features.next()) {
        var geom = feature.getGeometry();
        geom.transformTo(d_srs);
        var geomJson = geom.toObject()

        var rasterVal = null;
        if (geom != null) { 
            geomJson.crs = { type: 'name', properties: { name: 'EPSG:'+4326}}

            var rasterProperty = req.body.rasterProperty;
            rasterVal = feature.fields.get(rasterProperty);

            var newDatalayer = [
                newName,
                req.user.id,
                req.body.datafileId,
                epsg,
                req.body.layername,
                JSON.stringify(geomJson),
                req.body.description,
                req.body.location,
                JSON.stringify(feature.fields.toObject()),
                rasterVal, 
                rasterProperty
            ];
            
            connection.query('INSERT INTO public."Datalayers" (layername, "userId", "datafileId", epsg, "userLayerName", geometry, description, location, properties, rasterval, "rasterProperty", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ST_GeomFromGeoJSON(?), ?, ?, ?, ?, ?, current_timestamp, current_timestamp)', 
                { replacements: newDatalayer, type: connection.QueryTypes.INSERT }).then(projects => {
                // console.log("done!");
            });   
        }
    }
    totalTime = new Date - start;
    console.log('Took', totalTime, 'milliseconds to generate the upload-----------------------');
}

function pushDataLayer(file, epsg, newName, req, layer, callback) {
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

                    var rasterProperty = req.body.rasterProperty;
                    rasterVal = record.properties[rasterProperty]
                }

                var newDatalayer = {
                    layername: newName,
                    userId: req.user.id,
                    datafileId : req.body.datafileId,
                    epsg: epsg,
                    userLayerName : req.body.layername,
                    geometry: geom,
                    description : req.body.description,
                    location : req.body.location,
                    properties: record.properties,
                    rasterval: rasterVal, 
                    rasterProperty: rasterProperty
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
                        callback(null, epsg, newName, req.body.datafileId);
                    }
                }
            }
        }
    });
}

function pushDataRaster(epsg, layername, datafileID, file, rasterProperty, callback) {
    console.log("\n\n\n");
    var tableQuery = 'CREATE TABLE IF NOT EXISTS public.dataraster (id serial primary key, rast raster, layername text, datafileid integer, '+'"rasterProperty" text);';

    // var bboxQuery = tableQuery + 
    //                 "INSERT INTO public.dataraster (rast, layername) SELECT ST_SetSRID(St_asRaster(p.geometry, 500, 500, '32BF', rasterval, -999999), "+
    //                 epsg+"), p.layername FROM public."+'"Datalayers"' +"AS p WHERE layername='"+layername+"';";

    // var bboxQuery = bboxQuery + "CREATE INDEX raster_gix ON public.dataraster USING GIST (r.raster) FROM public.dataraster AS r WHERE layername='"+layername+"';"
    var bboxQuery = tableQuery + 
                    "INSERT INTO public.dataraster (rast, layername, datafileid) SELECT ST_SetSRID(St_asRaster(p.geometry, 500, 500, '32BF', rasterval, -999999), "+
                    epsg+"), p.layername, "+ datafileID + ', ' + rasterProperty + "FROM public."+'"Datalayers"' +"AS p WHERE layername='"+layername+"';";

    connection.query(bboxQuery).spread(function(results, metadata){
            console.log('Rasters Pushed!!!!');
            callback(null, file, [epsg, layername]);
        })
}

function loadData(datafileId, req, callback) {
    Model.Datafile.findById(datafileId).then(function(datafile){
        var filePath = datafile.location;   
        var dataset = gdal.open(filePath); // how do we know if this is synchronized?
        var layer = dataset.layers.get(0);
        var epsg = datafile.epsg;
        var fields = layer.fields.getNames();
        var geomType = datafile.geometryType;
        callback(null, filePath, layer, epsg, fields, req, geomType);
    });
}

function loadViewerData(datafileId, req, callback) {
    Model.Datafile.findById(datafileId).then(function(datafile){
        var filePath = datafile.location;   
        var dataset = gdal.open(filePath); // how do we know if this is synchronized?
        var layer = dataset.layers.get(0);
        var fieldsObject = {};
        layer.fields.forEach(function(field) {
            fieldsObject[field] = false;
        });

        layer.features.forEach(function(feature) {
            var currentFeatureFields = feature.fields.toObject();
            var keys = Object.keys(currentFeatureFields);
            keys.forEach(function(key) {
                if (parseFloat(currentFeatureFields[key]) !== NaN) {
                    fieldsObject[key] = true;
                }
            });
        });
        var unfilteredFields = layer.fields.getNames();
        var fields = unfilteredFields.filter(function(field) {
            return fieldsObject[field];
        });

        var epsg = datafile.epsg;
        callback(null, filePath, layer, epsg, fields, req);
        
    });
}

function getGeoJSON(file, layer, epsg, fields, req, callback) {
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

function getBoundingBox(file, layer, epsg, fields, req, callback){
 var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);
    var bBox = layer.getExtent().toPolygon();
    var centroid = bBox.centroid();

    bBox.transform(transformation);
    centroid.transform(transformation);
    callback(null, [bBox.toJSON(), centroid.toJSON(),  epsg])
}

function loadDatalayers(datafileId, req, callback) {
    Model.Datalayer.findAll({
        where: {
            datafileId : datafileId
        },
        include: [{
            model: Model.Datafile
        }]
        }).then(function(datalayers){
            parsedGeoJSON = [];
            datalayers.forEach(function(json, i) {
                parsedGeoJSON.push(json.geometry);
            })
            var bBox = datalayers[0].Datafile.bbox;
            var centroid = datalayers[0].Datafile.centroid;

            callback(null, [parsedGeoJSON, bBox, centroid]);
        
    });
}

function transformPoints(layer, d_srs, rasterProperty) {
    var features = [];
    while(feature = layer.features.next()) {
        var geom = feature.getGeometry();
        geom.transformTo(d_srs);
        var geomJson = geom.toObject();

        var currPt = {
            type: 'Feature',
            properties: {
                rasterVal: feature.fields.get(rasterProperty)
            },
            geometry: geomJson
        }
        features.push(currPt);
    }

    var geoJSON = {
        type: "FeatureCollection", 
        features: features
    }
    return geoJSON;
}

function processPoints(geoJSON) {
    var options = {gridType: 'hex', property: 'rasterVal', units: 'kilometers'};
    var grid = interpolate(geoJSON, 1, options);

    return grid;
}

module.exports = {
    queryRepeatedLayer : queryRepeatedLayer,
    pushDataLayerTransform : pushDataLayerTransformViaPromise,
    pushDataLayer : pushDataLayer,
    pushDataRaster : pushDataRaster,
    loadData : loadData,
    getGeoJSON : getGeoJSON,
    getBoundingBox : getBoundingBox,
    loadDatalayers : loadDatalayers,
    loadViewerData : loadViewerData
}