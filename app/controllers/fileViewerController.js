var fileViewerHelper = require('../../lib/fileViewerHelper'),
    processTheShapes = require('../../worker/worker2').processShapes,
    mailController = require('./mailController')
    util = require('util');
    var User = require('../models').User;

var Model = require('../models'),
    async = require('async');

module.exports.saveShapes = function(req, res) {
    var newReq = {
        body: { 
            rasterProperty: req.body.rasterProperty,
            datafileId : req.body.datafileId,
            layername: req.body.layername,
            description : req.body.description,
            location : req.body.location,
            epsg: req.body.epsg
        },
        user: {
            id: req.user.id
        }
    }
    

    // console.log(typeof(util.inspect(req)))
    processTheShapes(newReq, function(){
        User.findById(req.user.id).then(function(user){
            mailController.sendLayerEmail(user.email ,req.user.id);
        },
        function(err){}
        );   
    });
    res.send()
    res.redirect('/layers/' + req.user.id);
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
        async.apply(fileViewerHelper.loadViewerData, req.params.id, req.body),
        fileViewerHelper.getGeoJSON,
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

module.exports.serveThumbnailData = function(req, res) {
    async.waterfall([
        async.apply(fileViewerHelper.loadDatalayers, req.params.id, req.body),
    ], function (err, result) {
        res.send({
            geoJSON: result[0],
            centroid: result[2],
            bBox : result[1], 
            // fields : result[3],
            // epsg: result[4]
        })
    });  
}