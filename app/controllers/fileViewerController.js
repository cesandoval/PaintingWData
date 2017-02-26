var fileViewerHelper = require('../../lib/fileViewerHelper');

var Model = require('../models'),
    async = require('async');

module.exports.saveShapes = function(req, res) {
    var id = req.user.id,
        newEpsg = req.body.epsg,
        datafileId = req.body.datafileId,
        location = req.body.location,
        layerName = req.body.layername,
        description = req.body.description,
        dataProp = req.body.rasterProperty;

    async.waterfall([
        async.apply(fileViewerHelper.LoadData, id, req),
        fileViewerHelper.QueryRepeatedLayer,
        fileViewerHelper.PushDataLayerTransform,
        // pushDataLayer,
        // pushDataRaster
    ], function (err, result) {
        console.log(result)
        Model.Datafile.find({
            where : {
                userId : req.user.id,
            }
        }).then(function(datafiles){

            if (req.user.id) {
                console.log(req.user.id);
                res.redirect('/layers/' + req.user.id);
            }
        });
        
    });
}

module.exports.getDatalayers = function(req, res){
    console.log("Data layer id: " + req.params.datafileId + "\n\n");

    Model.Datafile.findOne({
        where : {
            userId : req.user.id,
            id : req.params.datafileId
        },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
    }).then(function(datafile){
        res.send({
            datafile
        })
    });
}

module.exports.serveMapData = function(req, res) {
    async.waterfall([
        async.apply(fileViewerHelper.LoadData, req.params.id, req.body),
        fileViewerHelper.GetGeoJSON,
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