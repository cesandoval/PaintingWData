var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    gdal = require('gdal')
Channel = require('../../worker/channel');
processVoxels = require('../../worker/worker2').processVoxels;
// const Op = Sequelize.Op;


//// TODO REFACTOR to pure controller
function getLastId(req, res) {
    var output = null;
    var dataset = null;
    var gfile = null;

    var totalcount = 0;
    Model.Datafile.findOne({
        where: {
            userId: req.user.id,
        },
        order: [['createdAt', 'DESC']]
        // limit: 1
    }).then(function (lastDataFile) {
        console.log("Break ----------------- \n \n ");


        var queryName = [lastDataFile.filename.substring(0, lastDataFile.filename.lastIndexOf("."))]
        queryName += [lastDataFile.filename.substring(lastDataFile.filename.lastIndexOf(".") + 1)]
        // name, ext

        console.log(lastDataFile.location);
        console.log('file id?' + lastDataFile.id)
        try {
            gfile = gdal.open(lastDataFile.location);
        }
        catch (e) {
            console.log('error opening file. Current location: ' + lastDataFile.location);
            req.flash('error opening file. Current location: ' + lastDataFile.location);
            
            console.log(e);
            return lastDataFile.id + "$$" + lastDataFile.location + "$$" + e.toString();
        }

        dataset = gfile.layers.get(0);
        // for(layer in gfile.layers) {
        //     console.log(layer.features.count())
        //     // console.log(layer.layername)
        // }
        console.log('set' + dataset.id)
        totalcount = dataset.features.count();
        console.log('totalcount = ' + totalcount)
        Model.Datalayer.count({
            where: {
                layername: queryName[0]
            }
        }).then(function (response) {
            // console.log([response, queryName])
            if(response == totalcount) {
                output = [[id, queryName[0], true]]
                var success  = true;

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
                    fs_extra.remove(lastDataFile.location, err => {
                        success = true;
                        if (err) {
                            console.log("Error cleaning local directory: ", lastDataFile.location);
                            console.log(err, err.stack);
                            success = false;
                            // callback(err);
                            //return error object here to make srue this is removed
                        }
                    })
                }
                if(!success)
                req.flash("Error cleaning local directory: ", gfile.location);
                
                return output
                
            }
            //add obj to response if its valid
            else {
                var outLayer = [[id, queryName[0], response, totalcount]]                
            
                var index = 0;
                if (!outLayer[1] || !outLayer[1] <= outLayer[2]) { // check if the output is valid
                        //put in an aerror flag
                        output.append([id, queryName[0],false])
                    }
                else {
                    output.append(outLayer)
                }   
            }
            return output
            });
        });
    }




function getLastIds(req, res, numIds) {
    Model.Datafile.findAll({
        where: {
            userId: req.user.id,
        },
        order: [['createdAt', 'DESC']],
        limit: numIds
    }).then(function (datafiles) {
        console.log("Break ----------------- \n \n ")
        // console.log(datafiles)
        output = []
        datafiles.forEach(function (json, i) {
            var queryName = json.filename.split('.')
            Model.Datalayer.count({
                where: {
                    layername: queryName[0]
                }
            }).then(function (numLayers) {
                console.log(numLayers)
                output.push([queryName[0], numLayers])
            })
        })

        // for (entry in datafiles) {
        //     datafile = datafiles
        //     console.log(datafile)
        //     var queryName = datafile.filename.split('.') // assumes files won' have multiple periods
        //     Model.Datalayer.count({
        //         where: {
        //             layername: queryName[0]
        //         }
        //     }).then(function (numLayers) {d
        //         console.log(numLayers)
        //         output.push([numLayers, queryName[0]])
        //     })
        // }
        return output;
    });
}

module.exports.datafileProgress = function (req, res) {
    lastId
    Model.Datafile.findAll({
        // attributes:
        where: {
            userId: req.user.id,
            order: ['createdAt', 'DESC']
            // createdAt: { // within the last two days
            //     [Op.lt]: new Date(),
            //     [Op.gt]: new Date(new Date() - 48 * 60 * 60 * 1000)            
            // }
        }
    }).then(function (datalayers) {
        console.log(datalayers)
        console.log("\n \n")
        for (datalayer in datalayers) {
            console.log(datalayer)
        }
    })
}

module.exports.endpoint = function (req, res) {
    // poll every 2.5 seconds and wait for a response
    // we need to cleartimeout when we get a sucess from the waterfall command
}

module.exports.updateShape = function (req, res, numIds = null) {
    // console.log(req.user)
    // console.log("END USER ----------------- \n \n ")

    response = getLastId(req, res)
    console.log(response) // assuming the workflow is right and i can get the max number of layers
}

module.exports.updateShapes = function (req, res, numIds = null) {
    // console.log(req.user)
    // console.log("END USER ----------------- \n \n ")


    // Model.Datafile.findAll({
    //     // attributes:
    //     // where: {
    //     //     // order: ['createdAt', 'DESC']
    //     //     // createdAt: { // within the last two days
    //     //     //     [Op.lt]: new Date(),
    //     //     //     [Op.gt]: new Date(new Date() - 48 * 60 * 60 * 1000)            
    //     //     // }
    //     // },
    //     limit: 2
    //   }).then(function(datalayers) {
    //       console.log(datalayers)
    //       console.log("END Datalayer ----------------- \n \n ")
    //       for( datalayer in datalayers.rows) {
    //         console.log(datalayer)
    //       }
    //   })
    // response = getLastId(req, res);

    response = getLastIds(req, res, 2)
    console.log(response) // assuming the workflow is right and i can get the max number of layers
}

