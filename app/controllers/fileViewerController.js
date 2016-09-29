var Model = require('../models'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require("shapefile"),
    async = require('async'),
    request = require('request');

module.exports.serveMapData = function(req, res) {
    async.waterfall([
        async.apply(loadData, req.params.id),
        getGeoJSON,
    ], function (err, result) {
        res.send({
            bBox : result[0], 
            geoJSON: result[1],
            centroid: result[2],
            fields : result[3]
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
    callback(null, [bBox.toJSON(), jsonGeoms, centroid.toJSON(), fields])
}
