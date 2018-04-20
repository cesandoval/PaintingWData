var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    gdal = require('gdal')
Channel = require('../../worker/channel');
processVoxels = require('../../worker/worker2').processVoxels;
// const Op = Sequelize.Op;

var numCalls = 0;

// deprecated, see getByIds
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
            output.push(['~/~ Error opening file. Current location: ' + dfile.location]);

            console.log(e);
            output.push([dfile.id + "$$" + dfile.location + "$$" + e.toString()]);
            res.send({progress: output});
            return false
        }

        dataset = gfile.layers.get(0);

        totalLayers = dataset.features.count();
        // console.log('totalLayers = ' + totalLayers);

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
                    output.push(["~/~ Error cleaning local directory: " +  gfile.location]);
            }
            //add obj to response if its valid
            else {
                var outLayer = [id, jobName[0], response, totalLayers]
                // console.log("outlayer: " + outLayer)
                console.log(outLayer)
                if (!outLayer[1] || !(outLayer[2] <= outLayer[3])) { // check if the output is valid
                    //put in error flag
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


// deprecated, see getByIds
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
            output.push(['ID Lookup error! Dfile id: ' + dfile.id + ", query id: " + id]);
            res.send({progress: output});
            return false
            //@carlos I'm just goign to return nothign here but let me know if i should handle it differentyly
        }


        try {
            gfile = gdal.open(dfile.location);
        }
        catch (e) {
            console.log('Error opening file. Current location: ' + dfile.location);
            output.push(['~/~ Error opening file. Current location: ' + dfile.location]);

            console.log(e);
            output.push([file.id + "$$" + dfile.location + "$$" + e.toString()]);
            res.send({progress: output});
            return false
        }

        dataset = gfile.layers.get(0);
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
                    output.push(["Error cleaning local directory: " + gfile.location]);
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


/**
* This function digs up info regarding the progress of jobs, for use in progressWidget.js.
* As stated in the comments of that file, we've assembled the query into the form:
* [id1$$id2$$...][hash1$numIds1$$hash2$numIds2$$...]
* and then for each of these, we'll get the progress of that. In particular, we return an array of 5-length arrays
* each of the form [id, jobName, num, den, type (either "shapes" or "voxels")]
*/
function getLastIds(req, res) {
    var output = [];
    var dataset = null;
    var gfile = null; // gdal file
    var locations = [];
    var jobNames = []; // [[name, ext]]
    var totalLayers = 0; // progress denominator
    var ids = []; // datafile and query id
    var denominators = [];

    var query = req.query.shapes;
    if(query === '') {
        res.send({progress: []})
        return false; // don't query if there is no query object
    }
    // Split by '$$', and further split by '$'; if it's a voxel job, this will have two elements.
    // Put everything into the 'jobs' array.
    jobIdentifiers = query.split("$$");
    jobs = [];
    for (var jI in jobIdentifiers) {
        jobs.push(jI.split("$"));
    }
    // Loop over every job. If it has length 1, it's a layer. If it has length 2, it's a voxel.
    for (var job in jobs){
        if (job.length == 2) { // Voxel!
            Model.Datavoxel.findOne({
                where: {
                    voxelId: job[0], // The hash
                }
            }).then(voxel => {
                return Model.Datajson.count({where: {hashVoxelId: voxel.voxelId}});
            }).then(numberProcessed => {
                output.push([job[0], numberProcessed, job[1], "voxels"]); //TODO: 2nd entry should be jobName.
            })
        }
        if (job.length == 1) { // Layer!
            Model.Datafile.findOne({
                where: {
                    userId: req.user.id,
                    id: job[0],
                },
                order: [['createdAt', 'DESC']]
            }).then(files => {
                
            })
        }
    }
    if (isVoxel){
        //THIS BLOCK IS FOR VOXELS ONLY
        Model.Datavoxel.findAll({
            where: {
                voxelId: ids[0], //TODO: make the code cleaner
            },
            order: [['createdAt', 'DESC']] //We only want to compute progress for the LATEST created voxel.
        }).then(function(voxels){
            voxel = voxels[0]; //get the first one of only one
            Model.Datajson.count({
                where: {
                    hashVoxelId: voxel.voxelId,
                }
            }).then(function(response){ //response = number of voxels loaded! ids[0] = density, or total voxels
                if (voxel.processed){
                    output.push([voxel.voxelId, voxel.voxelname, true]);
                }
                else{
                    output.push([voxel.voxelId, voxel.voxelname, response, ids.length - 1]); //In "ids", first argument is ID; rest of arguments are the layers. We want number of layers processed / total number of layers
                    console.log("Output: " + output);
                }
                res.send({ progress: output });
                return output;
            });
        });
        //END BLOCK FOR VOXELS ONLY
    }
    else {
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
                    console.log(dataset.features.count());
                    totalLayers = dataset.features.count();
                    denominators.push(totalLayers);
                    locations.push([gfile.location, dfile.location]);
                }
                catch (e) {
                    console.log('error opening file. Current location: ' + dfile.location)
                    console.log(e);

                    // output.push(['~/~ Error opening file. Current location: ' + dfile.location]);
                    // output.push([dfile.id + "$$" + dfile.location + "$$" + e.toString()]);

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
                console.log("We're trying to find all geometries where userID = " + req.user.id + " and datafileId = " + id);
                Model.Datalayer.count({// count geometries loaded
                    where: {
                        userId: req.user.id,
                        datafileId: id
                    }
                }).then(function (response) {
                    if (response == totalLayers && totalLayers !== null) {


                        console.log("resp: " + response + "  tlayers: " + totalLayers + "\n");
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
                                    //return error object here to make srue this is removed
                                }
                            })
                        }
                        if (!success)
                            output.push(["Error cleaning local directory: " + gLocation]);
                    }
                    //add obj to response if its valid
                    else {
                        var outLayer = [id, jobName[0], response, totalLayers];
                        if(outLayer[3] === null) {
                            output.push([id, jobName[0], null, null]);
                        }
                        else if(!outLayer[1] || !(outLayer[2] <= outLayer[3])){ // check if the output is valid
                            //put in an aerror flag
                            console.log("Invalid format error - numerator: " + outLayer[2] + " denom: " + outLayer[3])
                            output.push([id, jobName[0], false]);
                        }

                        else {
                            output.push(outLayer);
                        }
                    }
                    res.send({ progress: output });
                    console.log("File progress output: " + output);
                    return output
                });
            }
        });
    }
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
    getLastIds(req, res);
}


// for testing purposes. Does not make the progress tracker behave accurately.
function testTracker(req, res) {
    console.log(numCalls)
    var output;
        if( numCalls < 100 )
        {
            output = [[0, 'test job 1', 0, 1000],[1, 'test job 2', 100, 1000],[2, 'test job 3', 500, 1000],[3, 'test job 4 with an extremely long name that i don\'t think will fit', 100, 1000]]
            console.log('before send')
            res.send({ progress: output });
            console.log('after send')
        }


        else if( numCalls < 200)
        {
            output = [[0, 'test job 1', 100, 1000],[1, 'test job 2', 200, 1000],[2, 'test job 3', 600, 1000],[3, 'test job 4 with an extremely long name that i don\'t think will fit', 800, 1000]]
            res.send({ progress: output });
        }


        else if( numCalls < 300)
        {
             output = [[0, 'test job 1', false],[1, 'test job 2', true],[2, 'test job 3', 900, 1000],[3, 'test job 4 with an extremely long name that i don\'t think will fit', 800, 1000]]
            res.send({ progress: output });
        }


        else if( numCalls < 400)
        {
             output = [[0, 'test job 1', false],[1, 'test job 2', true],[2, 'test job 3', false],[3, 'test job 4 with an extremely long name that i don\'t think will fit', true]]
             res.send({ progress: output });
        }


        else if( numCalls < 500)
        {
            ouput = [[7+ "$$" + 'datafilelocation' + "$$" + 'errormessage']];
            res.send({progress: output});

        }


        else
        {
        output = [['~/~ This is a flash: ' + "here is the flash content"]];
        res.send({progress: output})
        }

        // else
        // {
        //     console.log('fdefault')
        // }



    numCalls++;

}
