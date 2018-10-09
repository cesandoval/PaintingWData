var Model = require('../app/models'),
    connection = require('../app/sequelize.js'),
    gdal = require("gdal"), 
    shapefile = require("shapefile"), 
    async = require('async'),
    fs = require('fs'), 
    path = require('path'),
    meta = require('@turf/meta'),
    random = require('@turf/random'),
    interpolate = require('@turf/interpolate'),
    pgp = require('pg-promise')();

var host = process.env === 'production' ? 'pwd.cvyt4sv5tkgm.us-west-1.rds.amazonaws.com' : 'pwd-develop.cpynefgvbqsq.us-east-1.rds.amazonaws.com';
console.log(host, process.env.NODE_ENV)
const cn = {
        host: host,
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

function saveJSON(file, epsg, newName, req, layer, geomType, callback) {
    fs.readFile(layer.filePath, 'utf8', function (err, data) {
        if (err) throw err; // we'll not consider error handling for now
        var geoJSON = JSON.parse(data)

        layer.geomType = geoJSON.features[0].geometry.type
        // Figure out if geometry is a Point
        var isPoint = layer.geomType.includes('Point');    

        // Push geometries as promises
        let promise = loopJSONPromises(geoJSON, req, layer)
        promise.then(() => {
            callback(null, req, layer)
        });

    });
}

/**
 * Transforms geometry in datalayers to same coordinate system. Sends geometry
 * in request object. Inputs inherited from queryRepeatedLayer. 
 * Called in fileProcessor.js.
 *
 * @since 0.0.0
 * @access private
 *
 * @param    {string}      file        path to file  
 * @param    {integer}     epsg        spatial projection
 * @param    {string}      newName     file name for projected geometry
 * @param    {object}      req         request
 * @param    {object}      layer       layer object containing geometry
 * @param    {string}      geomType    type of geometry
 * @param    {function}    callback    catches errors, returns request
 *
 * @return   {object}      returns request object  
 */
function pushDataLayerTransform(epsg, newName, req, layer, callback) {
    var totalTime;
    var start = new Date;

    var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);

    var itemsProcessed = 0, 
        totalFeatues = layer.features.count();

    let promise = loopPromises(d_srs, epsg, newName, req, layer)
    promise.then(() => {
        callback(null, req)
    });
}
function pushDataLayerTransform(file, epsg, newName, req, layer, geomType, callback) {
    var totalTime;
    var start = new Date;

    var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);

    var itemsProcessed = 0, 
        totalFeatues = layer.features.count();

    // Figure out if geometry is a Point
    var isPoint = geomType.includes('Point');    

    // Push geometries as promises
    let promise = loopPromises(d_srs, epsg, newName, req, layer)
    promise.then(() => {
        callback(null, req)
    });

    // In Case we want to handle points differently
    // if (isPoint) {
    //     // Get bbox
    //     var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
    //     d_srs = gdal.SpatialReference.fromEPSGA(4326);
    //     var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);
    //     var bBox = layer.getExtent().toPolygon();        
    //     bBox.transform(transformation);

    //     var transformedPts = transformPoints(layer, d_srs, req.body.rasterProperty);
    //     var idwCells = processPoints(transformedPts, bBox);
    //     let promise = loopPointPromises(epsg, newName, req, idwCells)
    //     promise.then(() => {
    //         callback(null, req)
    //     });
    // } else {
    //     let promise = loopPromises(d_srs, epsg, newName, req, layer)
    //     promise.then(() => {
    //         callback(null, req)
    //     });
    // }
}

function loopPointPromises(epsg, newName, req, idwCells) {
    return new Promise(async function(resolve, reject) {
        var rasterShapeId = 0; //Initialize for each datafile   
        
        for (cell in idwCells) {
            var currCell = idwCells[cell];
            var geomJson = currCell.geometry;
            geomJson.crs = { type: 'name', properties: { name: 'EPSG:'+4326}}

            pushPromise(geomJson, req, rasterVal, newName, epsg, {}, rasterShapeId);
            rasterShapeId = rasterShapeId + 1;
        }
        resolve(req)
    })
}

function loopPromises(d_srs, epsg, newName, req, layer) {
    return new Promise(async function(resolve, reject) {
        var rasterShapeId = 0; //Initialize for each datafile  

        while (feature = layer.features.next()) { 
            var geom = feature.getGeometry();
            geom.transformTo(d_srs);
            var geomJson = geom.toObject()
            var rasterVal = null;
            if (geom != null) { 
                await pushPromise(geomJson, req, rasterVal, newName, epsg, feature.fields.toObject(), rasterShapeId)
                rasterShapeId = rasterShapeId + 1;
            }
        }
        resolve(req)
    })
}

function loopJSONPromises(geoJSON, req, layer) {
    return new Promise(async function(resolve, reject) {
        var rasterShapeId = 0; //Initialize for each datafile  
        var features = geoJSON.features

        for (const feature in features) { 
            var geomJson = features[feature].geometry
            var rasterVal = null;
            if (geomJson != null) { 
                await pushPromise(geomJson, req, rasterVal, layer.name, 4326, features[feature].properties, rasterShapeId)
                rasterShapeId = rasterShapeId + 1;
            }
        }
        resolve(req)
    })
}

function getCentroidBbox(req, layer, callback) {
    var bboxQuery = "SELECT ST_SetSRID(ST_Extent(g.geometry),"+ '4326'+") FROM public."+'"Datalayers"' + ` AS g WHERE g."datafileId"= '` + layer.datafileId + `';`;

    connection.query(bboxQuery).spread(function(results, metadata){
        var bbox = results[0].st_setsrid;
        bbox.crs = { type: 'name', properties: { name: 'EPSG:'+4326}};
        coords = bbox.coordinates
        let centroidCoords = getAverage(bbox.coordinates[0])
        let centroid = {
            type: "Point", 
            coordinates: centroidCoords,
            crs: { type: 'name', properties: { name: 'EPSG:'+4326}}
        }
        
        Model.Datafile.findOne({
            where: {
                id: layer.datafileId
            }
        }).then(function(datafile){
            datafile.update({
                bbox: bbox,
                centroid: centroid,
                geometryType: layer.geomType
            }).then(function() {
                callback(null, req)
            })
        }) 
    })
}

function getAverage(coords) {
    lat = 0
    lon = 0
    for (coord in coords){
        lat += parseFloat(coords[coord][0])
        lon += parseFloat(coords[coord][1])
    }
    return [lat/coords.length, lon/coords.length]
}

/**
 * Insert layer into database.
 *
 * @since 0.0.0
 * @access private
 *
 * @param    {object}     geomJson        layer geography as json   
 * @param    {object}     req             request
 * @param    {string}     newName         layer name
 * @param    {integer}    epsg            spatial projection
 * @param    {object}     featuresJSON    layer features as json
 *
 * @return   {null}       Will log an error if it doesn't work. 
 */
function pushPromise(geomJson, req, rasterVal, newName, epsg, featuresJSON, rasterShapeId) {
    if (geomJson != null) { 
        geomJson.crs = { type: 'name', properties: { name: 'EPSG:'+4326}}
        var rasterProperty = req.body.rasterProperty;

        db.one('INSERT INTO public."Datalayers" (layername, "userId", "datafileId", epsg, "userLayerName", geometry, description, location, properties, rasterval, "rasterProperty", "createdAt", "updatedAt") VALUES (${layername}, ${userId}, ${datafileId}, ${epsg}, ${userLayerName}, ST_GeomFromGeoJSON(${geometry}), ${description}, ${location}, ${properties}, ${rasterval}, ${rasterProperty}, current_timestamp, current_timestamp) RETURNING id',
        {
            layername: newName,
            userId: req.user.id,
            datafileId: req.body.datafileId,
            epsg: epsg,
            userLayerName: req.body.layername,
            geometry: JSON.stringify(geomJson),
            description: req.body.description,
            location: req.body.location,
            properties: JSON.stringify(featuresJSON),
            rasterval: rasterShapeId, 
            rasterProperty: rasterProperty
        })
            .then(data => {
                // success, all records inserted
                // Make a datadbf connected to the datalayer
                dataDbf = Model.Datadbf.build();
                dataDbf.userId = req.user.id;
                // dataDbf.datalayerId = data.id;
                dataDbf.datalayerId = rasterShapeId;
                dataDbf.datafileId = req.body.datafileId;
                dataDbf.properties = JSON.stringify(featuresJSON);
                dataDbf.save();
                // console.log('saving....', rasterShapeId)
                
            })
            .catch(error => {
                // error
                console.log('DB ERROR:', error);
            });

    }
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

function processPoints(geoJSON, bbox) {
    var cellSize = bbox.getArea() / 20;
    var options = {gridType: 'hex', property: 'rasterVal', units: 'degrees'};
    var grid = interpolate(geoJSON, cellSize, options);

    return grid.features;
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

function loadSimplifiedDatalayers(datafileId, req, callback) {
    Model.Datafile.findOne({
        where: {
            id : datafileId
        }
    }).then(function(datafile){
        if (datafile.geometryType != 'Point') {
            // Simplifies the geometry and attempts to keep it topologically consistent
            var geomQuery = `SELECT ST_SimplifyPreserveTopology(geom.geometry, 0.0001) FROM public."Datalayers" AS geom WHERE geom."datafileId"= '` + datafileId +`';`
            connection.query(geomQuery).spread(function(datalayers){
                parsedGeoJSON = [];
                datalayers.forEach(function(json, i) {
                    parsedGeoJSON.push(json.st_simplifypreservetopology);
                })
                callback(null, [parsedGeoJSON, datafile.bbox, datafile.centroid])
            })
        } else { 
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
    })  
}


module.exports = {
    queryRepeatedLayer : queryRepeatedLayer,
    pushDataLayerTransform : pushDataLayerTransform,
    pushDataRaster : pushDataRaster,
    loadData : loadData,
    getGeoJSON : getGeoJSON,
    getBoundingBox : getBoundingBox,
    loadDatalayers : loadDatalayers,
    loadViewerData : loadViewerData,
    loadSimplifiedDatalayers: loadSimplifiedDatalayers,
    saveJSON: saveJSON,
    getCentroidBbox: getCentroidBbox,
}