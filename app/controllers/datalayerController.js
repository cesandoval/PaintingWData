var Model = require('../models'),
    connection = require('../sequelize.js'),
    async = require('async'),
    path = require('path'),
    request = require('request');


// TODO
// Add properties to spatial features so they behave like GIS
// async.waterfall([
//     loadData,
//     queryLayerName,
//     getEPSG,
//     pushDataLayer,
//     pushDataRaster,
//     getBbox,
//     getNet,
//     pushDataNet
// ], function (err, result) {
//     console.log(result)
// });

// async.waterfall([
//     stValue,
//     parseGeoJSON
// ], function (err, result) {
//     Model.DataJSON.sync().then(function(){
//         return Model.DataJSON.create(result);
//     });
// });

// This file extracts the datalayer ids from the request object and saves it on
// the datalayerIds object. 
// The datalayer objects are all strings containing ids. Eg "3", "7" ...
module.exports.computeVoxels = function(req, res){
    var datalayerIds = [];
    req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
        if(datalayerId !== "")
            datalayerIds.push(datalayerId);
    });

     
    async.waterfall([
        async.apply(getBbox, datalayerIds),
        // getNet,
        // pushDataNet
    ], function (err, result) {
        console.log(result.coordinates);
    });

    res.send(datalayerIds);  

}

module.exports.show = function(req, res) {
     Model.Datafile.findAll({
            where : {
                userId : req.user.id,
            }
        }).then(function(datafiles){
        // console.log(datafiles)
            res.render('layers', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user});
        });
}


function getBbox(datalayerIds, callback) {

    // NEED TO DEFINE THE EPSG FROM THE QUERY....
    var epsg = 4326;
    var idsQuery = datalayerIds.toString();
    console.log(idsQuery);
    
    var bboxQuery = "SELECT ST_SetSRID(ST_Extent(p.geometry),"+
                    epsg+") FROM public."+'"Datalayers"' + "AS p WHERE "
                    +'"datafileId"'+" in ("+idsQuery+");";
    connection.query(bboxQuery).spread(function(results, metadata){
        // here i have to check if the result coords are the same.....
        console.log(results);
        var bbox = results[0].st_setsrid
        callback(null, bbox);
    })
}

function getNet(bbox, layername, epsg, callback) {
    console.log("=========================================");
    console.log(`in ${Function.name}`);
    console.log("\n\n\n");
    var stepSize = 700;

    var netFunctionQuery = `
    CREATE OR REPLACE FUNCTION st_polygrid(geometry, integer) RETURNS geometry AS
    $$
    SELECT 
        ST_SetSRID(ST_Collect(ST_POINT(x,y)), ST_SRID($1))
    FROM 
        generate_series(floor(ST_XMin($1))::numeric, ceiling(ST_xmax($1))::numeric, $2) as x,
        generate_series(floor(ST_ymin($1))::numeric, ceiling(ST_ymax($1))::numeric,$2) as y 
    WHERE
        ST_Intersects($1,ST_SetSRID(ST_POINT(x,y), ST_SRID($1)))
    $$
    LANGUAGE sql VOLATILE;

    SELECT
        st_polygrid(ST_SetSRID(ST_GeomFromGeoJSON('`+JSON.stringify(bbox)+`'),`+epsg+`), `+stepSize+`) AS point_net
    `

    connection.query(netFunctionQuery).spread(function(results, metadata){
        callback(null, results[0], layername, epsg);//
    })
}
