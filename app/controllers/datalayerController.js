var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    Channel = require('../../worker/channel');
    processVoxels = require('../../worker/worker2').processVoxels;

// This file extracts the datalayer ids from the request object and saves it on
// the datalayerIds object.
// The datalayer objects are all strings containing ids. Eg "3", "7" ...


module.exports.computeVoxels = function(req, res){
    if  (req.body.datalayerIds !== ''){
        var datalayerIds = [];
        var datalayerIdString = req.body.datalayerIds;
        req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
            if(datalayerId !== ""){
                datalayerIds.push(datalayerId);
            }
        });

        if (req.body.layerButton == 'delete') {
            Model.Datafile.update({
                deleted: true
            }, {
                where: {
                    id: datalayerIds
                }
            }).then(function(){
                Model.Datalayer.update({
                    deleted:true
                }, {
                    where: {
                        datafileId: datalayerIds
                    }
                }).then(function(){
                    if (datalayerIds.length == 1) {
                        req.flash('layerAlert', "Your layer has been deleted");
                    } else {
                        req.flash('layerAlert', "Your layers have been deleted");
                    }
                    res.redirect('/layers/'+ req.user.id);
                })
            })
        } else {
            var req = {'user' : {'id' : req.user.id}, 'body':{'voxelname' : req.body.voxelname, 'datalayerIds': req.body.datalayerIds, voxelDensity: req.body.voxelDensity}};
            var datalayerIds = [];
            console.log("req: " + req);
            console.log("Data Layer ID: " + req.body.datalayerIds);
            req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
                if(datalayerId !== ""){
                    datalayerIds.push(datalayerId);
                }
            });
            req['voxelID'] = hash();
            processVoxels([datalayerIds, req], function(){});

            res.redirect('/voxels/'+ req.user.id + '/' + req['voxelID'] + "$$" + datalayerIds.join("$$"));
        }
    } else {
        console.log('select layers!!!!');
        req.flash('layerAlert', "You haven't selected layers. Please select at least one layer.");
        res.redirect('/layers/'+ req.user.id);
    }
};

module.exports.show = function(req, res) {
    Model.Datafile.findAll({
        where : {
            userId : req.user.id,
            deleted: {$not: true}
        },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
        }).then(function(datafiles){

            res.render('layers', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user, layerAlert: req.flash('layerAlert')[0]});
        });
}

module.exports.showVoxels= function(req, res) {
     Model.Datavoxel.findAll({
            where : {
                userId : req.user.id,
                processed : true,
                deleted: {$not: true}
            },
            include: [{
                model: Model.Datafile, include: [{
                    model: Model.Datalayer,
                    limit: 1
                }]
            }]
        }).then(function(datavoxels){
            console.log("------------------------------------------------");
            res.render('voxels', {id: req.params.id, datavoxels : datavoxels, userSignedIn: req.isAuthenticated(), user: req.user, voxelAlert: req.flash('voxelAlert')[0]});
        });
}


module.exports.transformVoxels = function(req, res) {
    console.log(req.body)

    if  (req.body.datavoxelIds !== ''){
        var voxelId = parseInt(req.body.datavoxelIds);
        if (req.body.layerButton == 'open') {
            res.redirect('/app/'+ voxelId);

        } else{
            Model.Datavoxel.update({
                deleted: true
            }, {
                where: {
                    id: voxelId
                }
            }).then(function(){
                req.flash('voxelAlert', "Your Voxel has been deleted");
                res.redirect('/voxels/'+ req.user.id);
            });
        }
    } else {
        console.log('select layers!!!!');

        req.flash('voxelAlert', "You haven't selected a Voxel. Please select a Voxel.");
        res.redirect('/voxels/'+ req.user.id);

    }
}

//Helper function to generate a unique ID
function hash(){
    return (+new Date()).toString(32) + Math.floor(Math.random()*36).toString(36);
}
