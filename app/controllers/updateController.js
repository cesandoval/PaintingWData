var Model = require('../models'),
    _async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    gdal = require('gdal'),
    Promise = require('bluebird');
Channel = require('../../worker/channel');
processVoxels = require('../../worker/worker2').processVoxels;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var numCalls = 0;
/**
* This function digs up info regarding the progress of jobs, for use in progressWidget.js.
* As stated in the comments of that file, we've assembled the query into the form:
* [id1$$id2$$...][hash1$numIds1$$hash2$numIds2$$...]
* and then for each of these, we'll get the progress of that. In particular, we return an array of 6-length arrays
* each of the form [id, jobName, num, den, type (either "shapes" or "voxels"), copmleted (true or false)]
*/
module.exports.updateShapes = function (req, res) {
    var output = []; // the eventual array of 6-length arrays to return.
    // Everything that has to do with shapes!
    var dataset = null;
    var gfile = null; // gdal file
    var locations = [];
    var jobNames = []; // [[name, file extension]]
    var totalLayers = 0; // progress denominator
    var ids = []; // datafile and query id
    var denominators = [];
    // Everything that has to do with voxels!
    var currVoxels = [];
    // First step: parse the url
    var query = req.query.shapes;
    if(query === '') {
        res.send({progress: []})
        return false; // don't query if there is no query object
    }
    // Split by '$$', and further split by '$'; if it's a voxel job, this will have two elements.
    // Put everything into the 'jobs' array.
    var jobIdentifiers = query.split("$$");
    var shapeJobs = [];
    var voxelJobs = {};
    var currVoxel = null;
    for (var i in jobIdentifiers) {
        var jI = jobIdentifiers[i];
        var temp = jI.split("$");
        if (temp.length == 1)
            shapeJobs.push(parseInt(temp[0]));
        if (temp.length == 2)
            voxelJobs[temp[0]] = parseInt(temp[1]); // Keys are voxelIds; values are number of datalayerIds
                               // associated with the voxelId.
    }
    // First, find all the data voxel progresses and push to output.
    Model.Datavoxel.findAll({
        where: {
            userId: req.user.id,
            voxelId: Object.keys(voxelJobs)
        }
    }).then(voxels => {
        return Promise.mapSeries(voxels, function(voxel) {
            var currVoxel = voxel.get();
            currVoxels.push(currVoxel);
            return Model.Datajson.count({
                where: {
                    hashVoxelId: currVoxel.voxelId
                }
            });
        })
    }).spread(function (...numProcessed){
        for (var i = 0; i < numProcessed.length; i++){
            output.push([currVoxels[i].voxelId, currVoxels[i].voxelname, numProcessed[i], voxelJobs[currVoxels[i].voxelId], "voxels", false]);
        }
    }).then(function(){ //Next, query all the data files and push to output.
        console.log(output);
        return Model.Datafile.findAll({
            where: {
                userId: req.user.id,
                id: shapeJobs
            },
            order: [['createdAt', 'DESC']]
        });
    }).then(files => {
        return Promise.mapSeries(files, function(dfile){
            var jobName = []
            jobName.push(dfile.filename.substring(0, dfile.filename.lastIndexOf(".")));
            jobName.push(dfile.filename.substring(dfile.filename.lastIndexOf(".") + 1));
            ids.push(dfile.id);
            jobNames.push(jobName);

            try {
                gfile = gdal.open(dfile.location);
                dataset = gfile.layers.get(0);
                console.log(dataset.features.count());
                totalLayers = dataset.features.count();
                denominators.push(totalLayers);
                locations.push([gfile.location, dfile.location]);
            }
            catch (e) {
                console.log('error opening file. Current location: ' + dfile.location)
                console.log(e);
                denominators.push(null);
                locations.push(["no glocation found", dfile.location]);
            }
            return Model.Datalayer.count({// count geometries loaded
                where: {
                    userId: req.user.id,
                    datafileId: dfile.id
                }
            })
        })
    }).spread(function (...numProcessed){
        for (var i = 0; i < numProcessed.length; i++){
            output.push([ids[i], jobNames[i][0], numProcessed[i], denominators[i], "shapes", false]);
        }
        /*
        console.log("Chris Xu's final output: " + output);
        for (var i=0; i< output.length; i++){
            console.log("Element " + i + " is: " + output[i]);
        }
        */
        res.send({ progress: output });
    })
}