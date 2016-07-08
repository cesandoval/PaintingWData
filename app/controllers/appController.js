var Model = require('../models/models.js'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shp = require("shpjs");

module.exports.show = function(req, res) {
    // Model.User.findAll(
    // {where: { username: 'a' }}
    // ).then(function(users){
    //     console.log('controller queries')
    //     console.log(users)
    //     console.log('adding and returning users')
    // })

    // var raw_query = 'SELECT ST_AsGeoJSON(p.geom), ST_Value(r.rast, 1, p.geom) As rastervalue FROM public.cancer_pts AS p, public.cancer_raster2 AS r WHERE ST_Intersects(r.rast,p.geom);'

    connection.query(raw_query).spread(function(results, metadata){
        console.log(11111111);
        console.log(results[0]);
        console.log(22222222);
        console.log(metadata);
        console.log(33333333);
    })

    // var dataset = gdal.open("./shp/cancer_pt.shp");

    // console.log("number of bands: " + dataset.bands.count());
    // console.log("width: " + dataset.rasterSize.x);
    // console.log("height: " + dataset.rasterSize.y);
    // console.log("geotransform: " + dataset.geoTransform);
    // console.log("srs: " + (dataset.srs ? dataset.srs.toWKT() : 'null'));

	//for the shapefiles in the folder called 'files' with the name pandr.shp 
	// shp("shp/cancer_pt").then(function(geojson){
	// 	//do something with your geojson 
    //     console.log(1111111);
    //     console.log(geojson)
        

	// });

    res.render('app')

}
