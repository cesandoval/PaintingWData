var Model = require('../models/models.js'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require("shapefile"),
    async = require('async'),
    request = require('request');

module.exports.show = function(req, res) {
    async.waterfall([
        loadData,
        getGeoJSON,
    ], function (err, result) {
        res.render('uploadViewer', {
            bBox : result[0], 
            geoJSON: result[1],
            centroid: result[2]
        })
    });  
}

function loadData(callback) {
    // var file = "./app/controllers/shp/Risk_cancerresp_rep_part.shp";
    // var file = "./app/controllers/shp/cancer_pt_part.shp";
    var file = "./app/controllers/shp/Riyadh_Neighborhoods.shp";
    var dataset = gdal.open(file);
    var layer = dataset.layers.get(0);
    
    // This will be the EPSG coming from the fileLoader
    //var epsg = 2263;
    var epsg = 32638;

    callback(null, file, layer, epsg);
}

function getGeoJSON(file, layer, epsg, callback) {
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
    callback(null, [bBox.toJSON(), jsonGeoms, centroid.toJSON()])
}
