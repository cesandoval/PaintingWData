var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    manager = require('../../worker/manager')(10),
    // mailer = require('./mailController'),
    app = require('../../app');


// This file extracts the datalayer ids from the request object and saves it on
// the datalayerIds object. 
// The datalayer objects are all strings containing ids. Eg "3", "7" ...



module.exports.computeVoxels = function(req, res){
    var datalayerIds = [];
    var datalayerIdString = req.body.datalayerIds;
    req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
        if(datalayerId !== ""){
            datalayerIds.push(datalayerId);
        }
    });

    job ={'user' : {'id' : req.user.id}, 'body':{'voxelname' : req.body.voxelname, 'datalayerIds': req.body.datalayerIds}};
    manager.process(job, function (err, result){
            console.log("------------------------------------------------");
            console.log("done computing voxels.");
            // var mailOptions = {
            //     from: '"Painting With Data" <sender@email.com>', // sender
            //     to: req.user.email, // list of receivers
            //     subject: 'Done Processing Voxels', // Subject line
            //     text: 'Done Processing Voxels', // plaintext body
            //     html: '<b>Done processing voxels</b>' // html body, figure out how to d
            // };
            // mailer.sendMail(mailOptions, function(err, info){
            //     if(err){
            //         console.log("error sending mail: \n", err);
            //     }
            //     console.log("Mail sent", info.response);
            // });


        });

    res.redirect(`/voxels/${req.user.id}`);  
};

module.exports.show = function(req, res) {


    Model.Datafile.findAll({
        where : {
            userId : req.user.id,
        },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
        }).then(function(datafiles){

            res.render('layers', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user});
        });  
}

module.exports.showVoxels= function(req, res) {
     Model.Datavoxel.findAll({
            where : {
                userId : req.user.id,
                processed : true,
            },
            include: [{
                model: Model.Datafile, include: [{
                    model: Model.Datalayer,
                    limit: 1
                }]
            }]
        }).then(function(datavoxels){
            console.log("------------------------------------------------");
            
            res.render('voxels', {id: req.params.id, datavoxels : datavoxels, userSignedIn: req.isAuthenticated(), user: req.user});
        });
}

