var fileViewerHelper = require('../../lib/fileViewerHelper'),
    processShapes = require('../../worker/worker2').processShapes,
    mailController = require('./mailController')
    util = require('util');
    var User = require('../models').User;

var Model = require('../models'),
    async = require('async'),
    express = require('express');

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
    var app = express()

    Model.User.findById(req.user.id).then(function(user) {
        //send user an email
        var uploadsSize = parseFloat(user.uploadsSize);
        var newUploadsSize = uploadsSize + parseFloat(req.body.size);
        console.log('The user has uploaded a total of ' + newUploadsSize + ' mbs')

        if (app.get('env') !== 'production') {
            console.log(app.get('env'))
            newUploadsSize = 0;
        }
        if (newUploadsSize <= 100 || user.paidUser) {
            user.update({
                uploadsSize: uploadsSize + parseFloat(req.body.size)
            }).then(function() {
                processShapes(newReq, function(){});
                res.redirect('/layers/' + req.user.id+ '/' + newReq.body.datafileId);
            })
        } else {
            req.flash('accountAlert', "Your account has reached the upload storage limit. Check back soon to sign up for a Premium Account");
            res.redirect('/uploadViewer/'+ req.body.datafileId + '$$' + req.body.size); 
        }
    })
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
