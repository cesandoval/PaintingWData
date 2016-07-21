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

    // TODO
    // Add properties to spatial features so they behave like GIS
    async.waterfall([
        loadData,
        queryLayerName,
        getEPSG,
    ], function (err, result) {
        // var file = "./app/controllers/shp/Risk_cancerresp_rep_part.shp";
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
                properties: record.properties
            }

            if (geom != null) {
                cargo.push(newDataLayer, function(err) {
                    // some
                });
            }

            if( record !== shapefile.end ) reader.readRecord( shapeLoader );
            if(record == shapefile.end) {
                cargo.drain = function () {
                    console.log('All Items have been processed!!!!!!')
                }
            }
        }
    });

    function loadData(callback) {
        // var file = "./app/controllers/shp/Risk_cancerresp_rep_part.shp";
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

                var raw_query = "SELECT g.layername FROM public.datalayer AS g WHERE g.layername LIKE '"+prevName+"_%'"
                connection.query(raw_query).spread(function(results, metadata){
                    if (results.length > 0) {
                        var hashedName = results[results.length-1].layername;
                        var n = hashedName.lastIndexOf("_");
                        var newLayerIndex = parseInt(hashedName.slice(n+1))+1;

                        console.log('repeated layers!!!! we must add a number to the count')
                        newName = hashedName.slice(0,n+1)+newLayerIndex;
                    } else {
                        newName = prevName+'_1';
                        console.log('repeated layers!!!!')
                    } 
                    callback(null, layer, newName);
                });
            } else {
                newName = layer.name;
                callback(null, layer, newName);
            }            
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

// var netFunctionQuery = `DROP FUNCTION IF EXISTS makegrid(geometry, integer);
// CREATE OR REPLACE FUNCTION makegrid(geometry, integer)
// RETURNS geometry AS
// 'SELECT ST_Collect(ST_SetSRID(ST_POINT(x,y),ST_SRID($1))) FROM 
// generate_series(floor(st_xmin($1))::int, ceiling(st_xmax($1)-st_xmin($1))::int, $2) as x
// ,generate_series(floor(st_ymin($1))::int, ceiling(st_ymax($1)-st_ymin($1))::int,$2) as y 
// where st_intersects($1,ST_SetSRID(ST_POINT(x,y),ST_SRID($1)))'
// LANGUAGE sql;
// SELECT makegrid(geometry, 10) from public.datalayer;
// `;

// var netFunctionQuery = `CREATE OR REPLACE FUNCTION ST_CreateFishnet(nrow integer, ncol integer,xsize float8, ysize float8,x0 float8 DEFAULT 0, y0 float8 DEFAULT 0,OUT "row" integer, OUT col integer,OUT geom geometry)
// RETURNS SETOF record AS
// $$
// SELECT i + 1 AS row, j + 1 AS col, ST_Translate(cell, j * $3 + $5, i * $4 + $6) AS geom
// FROM generate_series(0, $1 - 1) AS i,
//      generate_series(0, $2 - 1) AS j,
// (
// SELECT ('POLYGON((0 0, 0 '||$4||', '||$3||' '||$4||', '||$3||' 0,0 0))')::geometry AS cell
// ) AS foo;
// $$ LANGUAGE sql IMMUTABLE STRICT;`
// var netFunctionQuery = `CREATE OR REPLACE FUNCTION makegrid(geometry, integer) RETURNS geometry AS 'SELECT ST_Collect(ST_SetSRID(ST_POINT(x,y),ST_SRID($1))) FROM generate_series(floor(st_xmin($1))::int, ceiling(st_xmax($1)-st_xmin($1))::int, $2) as x,generate_series(floor(st_ymin($1))::int, ceiling(st_ymax($1)-st_ymin($1))::int,$2) as y where st_intersects($1,ST_SetSRID(ST_POINT(x,y),ST_SRID($1)))'LANGUAGE sql;`

// console.log(netFunctionQuery);

// var newQuery = "SELECT makegrid(ST_GeomFromText('Polygon((35.099577 45.183417,47.283415 45.183417,47.283415 49.640445,35.099577 49.640445,35.099577 45.183417))', 4326), 10) from public.datalayer;"
// var newQuery = `SELECT *
// FROM ST_CreateFishnet(2, 2, 10, 10) AS cells;`

var netFunctionQuery = `
CREATE OR REPLACE FUNCTION public.makegrid_2d (
  bound_polygon public.geometry,
  grid_step integer,
  metric_srid integer = 28408 --metric SRID (this particular is optimal for the Western Russia)
)
RETURNS public.geometry AS
$body$
DECLARE
  BoundM public.geometry; --Bound polygon transformed to the metric projection (with metric_srid SRID)
  Xmin DOUBLE PRECISION;
  Xmax DOUBLE PRECISION;
  Ymax DOUBLE PRECISION;
  X DOUBLE PRECISION;
  Y DOUBLE PRECISION;
  sectors public.geometry[];
  i INTEGER;
BEGIN
  BoundM := ST_Transform($1, $3); --From WGS84 (SRID 4326) to the metric projection, to operate with step in meters
  Xmin := ST_XMin(BoundM);
  Xmax := ST_XMax(BoundM);
  Ymax := ST_YMax(BoundM);

  Y := ST_YMin(BoundM); --current sector's corner coordinate
  i := -1;
  <<yloop>>
  LOOP
    IF (Y > Ymax) THEN  --Better if generating polygons exceeds the bound for one step. You always can crop the result. But if not you may get not quite correct data for outbound polygons (e.g. if you calculate frequency per sector)
        EXIT;
    END IF;

    X := Xmin;
    <<xloop>>
    LOOP
      IF (X > Xmax) THEN
          EXIT;
      END IF;

      i := i + 1;
      sectors[i] := ST_GeomFromText('POLYGON(('||X||' '||Y||', '||(X+$2)||' '||Y||', '||(X+$2)||' '||(Y+$2)||', '||X||' '||(Y+$2)||', '||X||' '||Y||'))', $3);

      X := X + $2;
    END LOOP xloop;
    Y := Y + $2;
  END LOOP yloop;

  RETURN ST_Transform(ST_Collect(sectors), ST_SRID($1));
END;
$body$
LANGUAGE 'plpgsql';
SELECT cell FROM 
(SELECT (
ST_Dump(makegrid_2d(ST_GeomFromText('Polygon((35.099577 45.183417,47.283415 45.183417,47.283415 49.640445,35.099577 49.640445,35.099577 45.183417))',
 4326), -- WGS84 SRID
 10000) -- cell step in meters
)).geom AS cell) AS q_grid
`

connection.query(netFunctionQuery).spread(function(results, metadata){
    console.log(11111111);
    console.log(results);
    console.log(22222222);
    console.log(metadata);
    console.log(33333333);
})

