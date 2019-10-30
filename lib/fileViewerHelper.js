var Model = require('../app/models'),
    connection = require('../app/sequelize.js'),
    gdal = require("gdal"), 
    async = require('async'),
    interpolate = require('@turf/interpolate'),
    pgp = require('pg-promise')();

var host = process.env === 'production' ? 'pwd.cvyt4sv5tkgm.us-west-1.rds.amazonaws.com' : 'pwd-develop.cpynefgvbqsq.us-east-1.rds.amazonaws.com';
console.log(host, process.env.NODE_ENV)

// we set some values for the db, user, and pw
const cn = {
        host: host,
        database: 'PaintingWithData_Riyadh',
        user: 'postgres',
        password: 'postgrespass'
    };

// Opens up a Postgres connection with pgpromise, 
const db = pgp(cn);

/**
 * Checks if a layername already exists in the DB, adds a counter if it already exists
 * @param {Function} callback catches errors, returns request
 * @param {integer} epsg spatial projection
 * @param {Array} fields name of the spatial properties in the file
 * @param {string} file path to file 
 * @param {string} geomType type of geometry
 * @param {Object} layer layer object containing geometry
 * @param {Object} req
 */
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
        promise.then(() => {callback(null, req, layer)})
            .catch((err) => {
                console.log("Error: ", err)
                callback('The coordinate reference system is not WGS84')    
            }) 
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
function pushDataLayerTransform(file, epsg, newName, req, layer, geomType, callback) {
    var totalTime;
    var start = new Date;

    // var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
    var d_srs = gdal.SpatialReference.fromEPSGA(4326);
    console.log(geomType);
    // var transformation = new gdal.CoordinateTransformation(layer.srs, d_srs);
    //
    // // Figure out if geometry is a Point
    // var isPoint = geomType.includes('Point');
    //
    // // In Case we want to handle points differently
    // if (isPoint) {
    //     // Get bbox of the dataset
    //     var bBox = layer.getExtent().toPolygon();
    //     // Transform the bbox geometry to a new spatial reference
    //     bBox.transform(transformation);
    //
    //     // Transform the points into a new spatial reference system, and return them as a geoJSON
    //     // TODO: here there is no need for passing a raster property anymore, instead, we are going to loop through all the properties in the geometry and add them to the geoJSON
    //     var transformedPts = transformPoints(layer, d_srs, req.body.rasterProperty);
    //     // Use the pioints to compute a spatial distribution of a property. Returns new polygons reflecting this distribution
    //     var idwCells = processPoints(transformedPts, bBox)
    //     // Loop through the geometries and insert them into the DB
    //     let promise = loopPointPromises(epsg, newName, req, idwCells)
    //     // Once the promise is done, send a callback function
    //     promise.then(() => {
    //         callback(null, req)
    //     });
    // // if we are not dealing with point geometries
    // } else {
        // Loop through the geometries and insert them into the DB
    let promise = loopPromises(d_srs, epsg, newName, req, layer)
        // Once the promise is done, send a callback function
    promise.then(() => {
        callback(null, req)
    });
    // }
}

/**
 * Loop through all the geometries outputted through the IDW function.
 * Save them into the DB through promises. 
 * Called in fileProcessor.js.
 *
 * @since 0.0.0
 * @access private
 *
 * @param    {integer}     epsg        spatial projection
 * @param    {string}      newName     file name for projected geometry
 * @param    {object}      req         request
 * @param    {idwCells}    Array    catches errors, returns request
 *
 * @return   {object}      returns request object  
 */
// function loopPointPromises(epsg, newName, req, idwCells) {
//     // Create a new promise
//     return new Promise(async function(resolve, reject) {
//         //Initialize for each datafile to start counting the number of geometries
//         var rasterShapeId = 0;
//         var rasterVal = 'some'
//
//         // Loop through all the geometries that were returned by the IDW function
//         for (cell in idwCells) {
//             // Get the current cell with a given index
//             var currCell = idwCells[cell]
//             // Get the geometry represntation
//             var geomJson = currCell.geometry;
//
//             // This functiom saves every geometry as a row on the Datalayers table, and its properties in the Datadbfs table
//             // TODO: We are currently only saving the geometry, but we should also pass the properties of each one of the cell geometries, that way the featuresJSON would not be empty as it currently is
//             await pushPromise(geomJson, req, rasterVal, newName, epsg, {}, rasterShapeId);
//             // Once the record is saved, add a number to the counter
//             rasterShapeId = rasterShapeId + 1;
//         }
//         // after all the records are saved, return a req
//         resolve(req)
//     })
// }

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
        let isValid = isValidJSON(features[0].geometry.coordinates)

        if (isValid) {
            for (const feature in features) { 
                var geomJson = features[feature].geometry
                var rasterVal = null;
                if (geomJson != null) { 
                    await pushPromise(geomJson, req, rasterVal, layer.name, 4326, features[feature].properties, rasterShapeId)
                    rasterShapeId = rasterShapeId + 1;
                }
            }
            resolve(req)
        } else reject('The coordinate reference system is not WGS84')
    })
}

function isValidJSON(coords) {
    return coords.some(function(e) {
        if(!isNaN(e)) {
            if (e >= -180 && e <= 180){
                return true
            } else {
                return false
            }            
        }
        else if(e) return isValidJSON(e)
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
        // Create a spatial reference object within the geometry object  
        geomJson.crs = { type: 'name', properties: { name: 'EPSG:'+4326}}
        var rasterProperty = req.body.rasterProperty;

        // Insert an individual record through a raw query
        db.one('INSERT INTO public."Datalayers" (layername, "userId", "datafileId", epsg, "userLayerName", geometry, description, location, properties, rasterval, "rasterProperty", "createdAt", "updatedAt") VALUES (${layername}, ${userId}, ${datafileId}, ${epsg}, ${userLayerName}, ST_GeomFromGeoJSON(${geometry}), ${description}, ${location}, ${properties}, ${rasterval}, ${rasterProperty}, current_timestamp, current_timestamp) RETURNING id',
        // Parse the values into the raw query
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
        // One the geometry record is saved, save the properties of the geometry
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

/**
 * Extracts the geometries and properties of a geometry, reprojects them
 * Restructures the data into a geoJSON readable by the IDW function
 *
 * @since 0.0.0
 * @access private
 *
 * @param    {object}     layer           layer object containing geometry
 * @param    {Function}   d_srs           spatial reference 
 * @param    {integer}    rasterProperty  spatial projection
 *
 */
function transformPoints(layer, d_srs, rasterProperty) {
    var features = [];
    // Loop though all the geometries until finished
    while(feature = layer.features.next()) {
        // Obtain the geometry from the individual feature
        // A feature is composed of geometry and properties aka fields
        // More info here: http://naturalatlas.github.io/node-gdal/classes/gdal.Feature.html
        var geom = feature.getGeometry();
        // Transform the geometry to a new coordinate system
        geom.transformTo(d_srs);
        // Cast the GDAL geometry into a JS object
        var geomJson = geom.toObject();
        var fields = feature.fields.toObject()

        // Structure the geometry and its properties as a geoJSON
        var currPt = {
            type: 'Feature',
            properties: fields,
            geometry: geomJson
        }
        features.push(currPt);
    }
    // Add the collection of features to the geoJSON
    var geoJSON = {
        type: "FeatureCollection", 
        features: features
    }
    return geoJSON;
}

/**
 * Takes a point collection represented as a geoJSON, and computes their spatial distribution
 * Returns an object which has features and properties?
 *
 * @since 0.0.0
 * @access private
 *
 * @param    {object}     geoJSON         geoJSON representation containing a collection of geometry with attributes
 * @param    {object}     bbox            an object containing a bbox geometry
 *
 */
function processPoints(geoJSON, bbox) {
    // Divides the area by a constant to get the size of cells in the grid of hexagons that will be used to compute the IDW function 
    // TODO: Determine the size of the cells in a better way
    var cellSize = bbox.getArea() / 20;
    // Sets up some options for the functions
    // TODO: The options should get updated with the different properties. This can be run on a loop to compute the IDW function for all the properties
    // property is currently a harcoded value
    
    // Interpolate the point geometries using an IDW function
    /**
     * SG TODO: run this function for all the properties, and save the different properties as new properties of the geometries 
     * "properties": {
     *      "prop0": "value0",
     *      "prop1": { "this": "that" }
     * }
     */
    let props = geoJSON.features[0].properties // key and val
    // call for first prop to instantiate grid
    console.log(props)
    console.log(geoJSON)
    var options = {gridType: 'hex', property: 'id', units: 'degrees'}
    let grid = interpolate(geoJSON, cellSize, options)
    
    const asyncForEach = async (props, callback) => {
        for (prop of props) {
            await callback(prop, grid)
        }
    }

    const start = async () => {
        await asyncForEach(props.slice(1), async (prop, grid) => {
            var options = {gridType: 'hex', property: prop, units: 'degrees'};
            var new_grid = interpolate(geoJSON, cellSize, options)
            // put new_grid vals in to grid
            for (let i = 0; i < new_grid.features.length; i++){ // iterate through each geo 
                var new_prop = new_grid.features[i].properties[0]; //gives us {key: val}
                grid.features[i].properties = Object.assign(grid.features[i].properties, new_prop)
            }    
            })
            debugger
        }   
        // done - console.log("Done")
    start();

    // Return all the geometries computed as an array
    // It will currently return the geometry and a single property
    // Object {type: "Feature", Object {id: 565.143268670556}, geometry: Object} 
    return grid.features
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