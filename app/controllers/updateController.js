var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    gdal = require('gdal')
Channel = require('../../worker/channel');
processVoxels = require('../../worker/worker2').processVoxels;
// const Op = Sequelize.Op;
// automatically render the layers page after a job is completed
// have a job completed show a full progresss bar until it is X'ed out by the user
// load a class for the widhget and serialize every time
// check if the values are correct??
// JSON PARSE this job and see if that works
// res.send the id of the uploaded job to this controller>? or to this 
//
var numCalls = 0;
//// TODO
// maybe add a field to the user on recently uploaded 
// ids so we can keep track of what to send to each user
function getLastId(req, res) {
    var output = [];
    var dataset = null;
    var gfile = null; // gdal file
    var jobName = []; // name, ext
    var totalLayers = 0; // progress denominator
    var id = null; // datafile and query id

    Model.Datafile.findOne({
        where: {
            userId: req.user.id,
        },
        order: [['createdAt', 'DESC']]
    }).then(function (dfile) {
        // console.log("Break ----------------- \n \n ");

        jobName.push(dfile.filename.substring(0, dfile.filename.lastIndexOf(".")));
        jobName.push(dfile.filename.substring(dfile.filename.lastIndexOf(".") + 1));
        id = dfile.id

        try {
            gfile = gdal.open(dfile.location);
        }
        catch (e) {
            console.log('error opening file. Current location: ' + dfile.location);
            req.flash('error opening file. Current location: ' + dfile.location);

            console.log(e);
            res.send(dfile.id + "$$" + dfile.location + "$$" + e.toString());
            return false
        }

        dataset = gfile.layers.get(0);

        //#TODO
        // datafilenames are not necessarily unique, so theri layers aren't going to be distinguashable
        // query bu the datafile id

        totalLayers = dataset.features.count();
        console.log('totalLayers = ' + totalLayers);

        //progress
        Model.Datalayer.count({// count geometries loaded
            where: {
                userId: req.user.id,
                datafileId: id
            }
        }).then(function (response) {
            if (response == totalLayers) {
                output.push([id, jobName[0], true])
                var success = true;

                //try deleting obj
                try{
                    fs_extra.remove(gfile.location, err => {
                        if (err) {
                            console.log("Error cleaning local directory: ", gfile.location);
                            // return gfile.location + "$$" + e.toString();                            
                            console.log(err, err.stack);
                            success = false;
                            // callback(err);
                        }
                    })
                }
                catch(e) {
                    console.log('File Location Error: ' + e);
                    console.log('RETRYING')
                    fs_extra.remove(dfile.location, err => {
                        success = true;
                        if (err) {
                            console.log("Error cleaning local directory: ", dfile.location);
                            console.log(err, err.stack);
                            success = false;
                            // callback(err);
                            //return error object here to make srue this is removed
                        }
                    })
                }
                if (!success)
                    req.flash("Error cleaning local directory: ", gfile.location);
            }
            //add obj to response if its valid
            else {
                var outLayer = [id, jobName[0], response, totalLayers]
                // console.log("outlayer: " + outLayer)
                console.log(outLayer)
                if (!outLayer[1] || !(outLayer[2] <= outLayer[3])) { // check if the output is valid
                    //put in an aerror flag
                    output.push([id, jobName[0], false])
                }
                else {

                    output.push(outLayer)
                }
            }
            // console.log(output)
            res.send({ progress: output })
            return output
        });
    });
}

function getById(req, res, id) {
    var output = [];
    var dataset = null;
    var gfile = null; // gdal file
    var jobName = []; // name, ext
    var totalLayers = 0; // progress denominator

    Model.Datafile.findOne({
        where: {
            userId: req.user.id,
            id: id
        },
    }).then(function (dfile) {
        // console.log("Break ----------------- \n \n ");

        jobName.push(dfile.filename.substring(0, dfile.filename.lastIndexOf(".")));
        jobName.push(dfile.filename.substring(dfile.filename.lastIndexOf(".") + 1));
        if (id != dfile.id) {
            res.flash('ID Lookup error! Dfile id: ' + dfile.id + ", query id: " + id)
            res.send(false);
            return false
            //@carlos I'm just goign to return nothign here but let me know if i should handle it differentyly
        }


        try {
            gfile = gdal.open(dfile.location);
        }
        catch (e) {
            console.log('error opening file. Current location: ' + dfile.location);
            req.flash('error opening file. Current location: ' + dfile.location);

            console.log(e);
            res.send(dfile.id + "$$" + dfile.location + "$$" + e.toString());
            return false
        }

        dataset = gfile.layers.get(0);

        //#TODO
        // datafilenames are not necessarily unique, so theri layers aren't going to be distinguashable
        // query bu the datafile id

        totalLayers = dataset.features.count();
        console.log('totalLayers = ' + totalLayers);

        //progress
        Model.Datalayer.count({// count geometries loaded
            where: {
                userId: req.user.id,
                datafileId: id
            }
        }).then(function (response) {
            if (response == totalLayers) {
                output.push([id, jobName[0], true])
                var success = true;

                //try deleting obj
                try{
                    fs_extra.remove(gfile.location, err => {
                        if (err) {
                            console.log("Error cleaning local directory: ", gfile.location);
                            // return gfile.location + "$$" + e.toString();                            
                            console.log(err, err.stack);
                            success = false;
                            // callback(err);
                        }
                    })
                }
                catch(e) {
                    console.log('File Location Error: ' + e);
                    console.log('RETRYING')
                    fs_extra.remove(dfile.location, err => {
                        success = true;
                        if (err) {
                            console.log("Error cleaning local directory: ", dfile.location);
                            console.log(err, err.stack);
                            success = false;
                            // callback(err);
                            //return error object here to make srue this is removed
                        }
                    })
                }
                if (!success)
                    req.flash("Error cleaning local directory: ", gfile.location);
            }
            //add obj to response if its valid
            else {
                var outLayer = [id, jobName[0], response, totalLayers]
                // console.log("outlayer: " + outLayer)
                console.log(outLayer)
                if (!outLayer[1] || !(outLayer[2] <= outLayer[3])) { // check if the output is valid
                    //put in an aerror flag
                    output.push([id, jobName[0], false])
                }
                else {

                    output.push(outLayer)
                }
            }
            // console.log(output)
            res.send({ progress: output })
            return output
        });
    });
}


//this is the funcitno that htprogresswidget will be using
// queries teh database by  Job id's and returns an array of items in the form....
//[id, jobname, progress, denominator] if the job is in progress or waiting
//[id, jobname, bool] bool == true if the job is done, false if the output is invalid
// jobname$$Errormessage
//takes query string of enpoint?shapes=id1$$id2$$id3
//hope to add the param &voxels=ids 
function getLastIds(req, res) {
    var output = [];
    var dataset = null;
    var gfile = null; // gdal file
    var locations = [];
    var jobNames = []; // [[name, ext]]
    var totalLayers = 0; // progress denominator
    var ids = []; // datafile and query id
    var denominators = [];

    console.log(req.query)
    ids = req.query.shapes.split("$$")
    if(!ids.length);
        return false; // don't query if there is no query object

    Model.Datafile.findAll({
        where: {
            userId: req.user.id,
            id: ids
        },
        order: [['createdAt', 'DESC']]

    }).then(function (files) {
        // console.log("Break ----------------- \n \n ");
        files.forEach((dfile, i) => {
            var jobName = []
            jobName.push(dfile.filename.substring(0, dfile.filename.lastIndexOf(".")));
            jobName.push(dfile.filename.substring(dfile.filename.lastIndexOf(".") + 1));
            ids.push(dfile.id);
            jobNames.push(jobName);

            try {
                gfile = gdal.open(dfile.location);
                dataset = gfile.layers.get(0);
                totalLayers = dataset.features.count();
                denominators.push(totalLayers);
                locations.push([gfile.location, dfile.location]);
            }
            catch (e) {
                console.log('error opening file. Current location: ' + dfile.location)
                console.log(e);

                req.flash('error opening file. Current location: ' + dfile.location);
                output.push(dfile.id + "$$" + dfile.location + "$$" + e.toString());

                denominators.push(null);
                locations.push(["no glocation found", dfile.location]);
            }
        })

        //progress
        for (var i = 0; i < ids.length; ids++) {
            jobName = jobNames[i]
            totalLayers = denominators[i]
            var id = ids[i]
            var gLocation = locations[i][0]
            var dLocation = locations[i][1]
            Model.Datalayer.count({// count geometries loaded
                where: {
                    userId: req.user.id,
                    datafileId: id
                }
            }).then(function (response) {
                if (response == totalLayers) {
                    output.push([id, jobName[0], true])
                    var success = true;

                    // try deleting obj
                    try{
                        fs_extra.remove(gLocation, err => {
                            if (err) {
                                console.log("Error cleaning local directory: ", gLocation);
                                // return gLocation + "$$" + e.toString();                            
                                console.log(err, err.stack);
                                success = false;
                                // callback(err);
                            }
                        })
                    }
                    catch(e) {
                        console.log('File Location Error: ' + e);
                        console.log('RETRYING')
                        fs_extra.remove(dLocation, err => {
                            success = true;
                            if (err) {
                                console.log("Error cleaning local directory: ", dLocation);
                                console.log(err, err.stack);
                                success = false;
                                // callback(err);
                                //return error object here to make srue this is removed
                            }
                        })
                    }
                    if (!success)
                        req.flash("Error cleaning local directory: ", gLocation);
                }
                //add obj to response if its valid
                else {
                    var outLayer = [id, jobName[0], response, totalLayers]
                    // console.log("outlayer: " + outLayer)
                    console.log(outLayer);
                    if (!outLayer[1] || !(outLayer[2] <= outLayer[3])) { // check if the output is valid
                        //put in an aerror flag
                        output.push([ids[i], jobName[0], false]);
                    }
                    else {
                        output.push(outLayer);
                    }
                }
                // console.log(output)

            });
        }
        res.send({ progress: output });
        console.log(output);
        return output
    });
}

module.exports.updateShape = function (req, res) {
    console.log('update shape')
    console.log(req.user)
    console.log("END USER ----------------- \n \n ")

    if (req.query.id) {
        response = getLastId(req, res, id);
    }
    else {
        response = getLastId(req, res);
    }
    console.log(response);
}

module.exports.updateShapes = function (req, res) {
    console.log('update shapes')
    console.log(req.user)
    console.log("END USER ----------------- \n \n ")

    // response = getLastIds(req, res);
    // console.log(response);
    testTracker(req, res);
}




function testTracker(req, res) {
    console.log(numCalls)
    var output;
        if( numCalls < 10 )
        {
            output = [[0, 'test job 1', 0, 1000],[1, 'test job 2', 100, 1000],[2, 'test job 3', 500, 1000],[3, 'test job 4 with an extremely long name that i don\'t think will fit', 100, 1000]]
            console.log('before send')
            res.send({ progress: output });
            console.log('after send')
        }
            
        
        else if( numCalls < 20)
        {
            output = [[0, 'test job 1', 100, 1000],[1, 'test job 2', 200, 1000],[2, 'test job 3', 600, 1000],[3, 'test job 4 with an extremely long name that i don\'t think will fit', 800, 1000]]
            res.send({ progress: output });
        }
            
        
        else if( numCalls < 30)
        {
             output = [[0, 'test job 1', false],[1, 'test job 2', true],[2, 'test job 3', 900, 1000],[3, 'test job 4 with an extremely long name that i don\'t think will fit', 800, 1000]]
            res.send({ progress: output });
        }
            
        
        else if( numCalls < 40)
        {
             output = [[0, 'test job 1', false],[1, 'test job 2', true],[2, 'test job 3', false],[3, 'test job 4 with an extremely long name that i don\'t think will fit', true]]
             res.send({ progress: output });
        }
            
        
        else if( numCalls < 50)
        {
            res.send(7+ "$$" + 'datafilelocation' + "$$" + 'errormessage');
        }
            

        else if(numCalls < 60)
        {
        req.flash('this is a flash', "here is the flash content")
        res.send(false)
        }
             
        else
        {
            console.log('fdefault')
        }

    
    numCalls++
    
}