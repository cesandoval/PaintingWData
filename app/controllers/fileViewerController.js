var fileViewerHelper = require('../../lib/fileViewerHelper'),
    processShapes = require('../../worker/worker2').processShapes,
    mailController = require('./mailController')
    util = require('util');
    var User = require('../models').User;

var Model = require('../models'),
    async = require('async'),
    express = require('express');

/**
 * Handles POST request for /uploadViewer page.
 * Saves layer that the user selected.
 * Unless the user has reached its account upload size limit and is not a premium account.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.saveShapes = function(req, res) {
    // Wenzhe - this is the JSON from the uploadViewer page from VUE
    // JSON to send to the backend
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
        // Send user an email
        var uploadsSize = parseFloat(user.uploadsSize);
        var newUploadsSize = uploadsSize + parseFloat(req.body.size);
        console.log('The user has uploaded a total of ' + newUploadsSize + ' mbs')

        // If not running on production mode, then ignore any upload size warnings
        if (app.get('env') !== 'production') {
            console.log(app.get('env'))
            newUploadsSize = 0;
        }

        // If User has uploaded more than 100, then do not allow if the it is not a Premium Account
        var UPLOAD_LIMIT = 100;
        if (newUploadsSize <= UPLOAD_LIMIT || user.paidUser) {
            user.update({
                uploadsSize: uploadsSize + parseFloat(req.body.size)
            }).then(function() {
                // Save layer and then redirect to /layers page
                // Sends a process to a worker
                processShapes(newReq, function(){});
                // You shouldn't have to redirect
                res.redirect('/layers/' + req.user.id+ '/' + newReq.body.datafileId);
            })
        } else {
            req.flash('accountAlert', "Your account has reached the upload storage limit. Check back soon to sign up for a Premium Account");
            res.redirect('/uploadViewer/'+ req.body.datafileId + '$$' + req.body.size); 
        }
    })
}


/**
 * Return the Datafile of a given datafileId (stored in req.params.datafileId)
 * Also returns datalayer and datadbf associated with the datafile
 * Used in user_layer.js to help display maps
 * @param {*} req 
 * @param {*} res 
 */
module.exports.getDatalayers = function(req, res){
    console.log("Data layer id: " + req.params.datafileId + "\n\n");

    Model.Datafile.findOne({
        where : {
            userId : req.user.id,
            id : req.params.datafileId
        },
        include: [{
            model: Model.Datalayer,
            limit: 1},
            {
            model: Model.Datadbf,
            limit: 1}]
    }).then(function(datafile){
        // console.log("datafile: ", datafile);
        res.send({
            datafile
        })
    });
}

/**
 * Get Map data with specified datafileId (using loadViewerData and getGeoJSON from fileViewerHelper.js)
 * Used in layers.js (as part of requestMap)
 * @param {*} req 
 * @param {*} res 
 */
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

/**
 * Get Thumbnail Data with specified datafileId (using loadDatalayers from fileViewerHelper.js)
 * Used in map_thumbnail_viewer.js
 * @param {*} req 
 * @param {*} res 
 */
module.exports.serveThumbnailData = function(req, res) {
    async.waterfall([
        async.apply(fileViewerHelper.loadSimplifiedDatalayers, req.params.id, req.body),
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
