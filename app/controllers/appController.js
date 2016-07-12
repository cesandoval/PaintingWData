var Model = require('../models/models.js'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shp = require("shpjs");

// var fs = require('fs');
// var obj;


module.exports.show = function(req, res) {
    // var raw_query = 'SELECT ST_AsGeoJSON(p.geom), ST_Value(r.rast, 1, p.geom) As rastervalue FROM public.cancer_pts AS p, public.cancer_raster2 AS r WHERE ST_Intersects(r.rast,p.geom);'

    // connection.query(raw_query).spread(function(results, metadata){
    //     console.log(11111111);
    //     console.log(results[0]);
    //     console.log(22222222);
    //     console.log(metadata);
    //     console.log(33333333);
    // })

    // fs.readFile('./app/controllers/points.json', 'utf8', function (err, data) {
    //     if (err) throw err;
    //     obj = JSON.parse(data);
    //     // console.log(obj)
    // });

    // var dataset = gdal.open("./app/controllers/raster/cancer.tif");


    // console.log("number of bands: " + dataset.bands.count());
    // console.log("width: " + dataset.rasterSize.x);
    // console.log("height: " + dataset.rasterSize.y);
    // console.log("geotransform: " + dataset.geoTransform);
    // console.log("srs: " + (dataset.srs ? dataset.srs.toWKT() : 'null'));
    var file = "./app/controllers/shp/cancer_pt.shp";
    var dataset = gdal.open(file);
    var layer = dataset.layers.get(0);
    
    console.log("fields: " + layer.fields.getNames());
    // console.log("features: " + layer.features.get(0).getGeometry().toJSON());
    console.log('type :' + layer.geomType )

    function toGeoJSON(features) {
        var geoms = []
        features.forEach(function(feature, i) {
            geoms.push(JSON.parse(feature.getGeometry().toJSON()))
        })

        var geojson = {
            type: "GeometryCollection",
            geometries: JSON.parse(JSON.stringify(geoms.slice(0,50)))
        }

        return geojson;
    }

    // function IndGeoJSON(features) {
    //     features.forEach(function(feature, i) {
    //         var newDataLayer = {
    //             layerName: layer.name,
    //             userId: 1,
    //             epsg: layer.srs.getAttrValue("AUTHORITY",1),
    //             geometry: JSON.parse(feature.getGeometry().toJSON())
    //         }

    //         Model.DataLayer.create(newDataLayer)
    //         // Model.DataLayer.sync(
    //         // {
    //         //     // force: true
    //         // }).then(function () {
    //         //     // Table created
    //         //     return Model.DataLayer.create(newDataLayer).catch(function(error) {
    //         //         console.log(error)
    //         //         req.flash('error', "whoa")
    //         //         // res.redirect('app')
    //         //     })
    //         // })
    //     })
    //     return;
    // }

    // var geoJSON = IndGeoJSON(layer.features);


    // TODO: Add spatial index

    var test = JSON.parse(layer.features.get(0).getGeometry().toJSON());
    console.log(test);
    console.log(typeof(test))
    var geoJSON = toGeoJSON(layer.features);
    console.log(geoJSON)
    console.log(typeof(geoJSON))

    var newDataLayer = {
        layerName: layer.name,
        userId: 1,
        epsg: layer.srs.getAttrValue("AUTHORITY",1),
        geometry: geoJSON,
        // geometry: test
        // userId: 1
    }
    console.log(newDataLayer);

    Model.DataLayer.sync(
    {
        force: true
    }).then(function () {
        // Table created
        return Model.DataLayer.create(newDataLayer).then(function() {
            res.render('app')
        }).catch(function(error) {
            console.log(error)
            req.flash('error', "whoa")
            res.redirect('app')
        })
    })


    // res.render('app')
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
