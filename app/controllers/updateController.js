var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    $ = require('jquery'),
    Channel = require('../../worker/channel');
processVoxels = require('../../worker/worker2').processVoxels;
// const Op = Sequelize.Op;


//// didn't make a pure controller, i could but maybe once this gets bigger?
function getLastId(req, res) {
    Model.Datafile.findOne({
        where: {
            userId: req.user.id,
        },
        order: [['createdAt', 'DESC']]
        // limit: 1
    }).then(function (lastFile) {
        console.log("Break ----------------- \n \n ")
        console.log(lastFile)
        var queryName = lastFile.filename.split('.') // assumes files won' have multiple periods
        Model.Datalayer.count({
            where: {
                layername: queryName[0]
            }
        }).then(function (response) {
            console.log([response, queryName])
            return [response, queryName]
        })

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
                output.push([numLayers, queryName[0]])
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
        //     }).then(function (numLayers) {
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
    var numIds = req.body.numIds ? req.body.numIds : null
    console.log(req.body)
    
    setTimeout(pollShapeUpdates(req, res, numIds), 2500) // poll every 2.5 seconds and wait for a response
    // we need to cleartimeout when we get a sucess from the waterfall command
}

module.exports.updateShape = function (req, res, numIds = null) {
    console.log(req.user)
    console.log("END USER ----------------- \n \n ")

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

module.exports.pollShapeUpdates = function(req, res, id = null) {

    suffix = id ? "" : "/id:" + id

    $.ajax({
        url: "/update/shapes" + suffix,
        type: 'GET',
        cache: false, // should this be?
        // processData: false, 
        // contentType: false, 
        success: function (data) {
            if (data.progress.length > 1) {
                output = []
                console.log(data.progress)
                for(item in data.progress) {
                    output.append(handleProgess(item))
                }
                return output
            }
            else {
                return handleProgess(data.progress)
            }
        },
        failure: function (err) {
            console.log(err);
        }
    })
}

function handleProgess(input) {
    console.log(input);
}