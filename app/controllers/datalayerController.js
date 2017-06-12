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
    console.log(req.body)

    // $ = cheerio.load('<div id = "flashes"</div>');
    // console.log(flashHandler)
    // var flashHandler = $('#flashes');

    // flashHandler.on('flash', function(event, message){
    //     var flash = $('<div class="flash">');
    //     flash.text(message);
    //     flash.on('click', function(){
    //         $(this).remove();
    //         });
    //     $(this).append(flash);
    // });
    if  (req.body.datalayerIds !== ''){
        var datalayerIds = [];
        var datalayerIdString = req.body.datalayerIds;
        req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
            if(datalayerId !== ""){
                datalayerIds.push(datalayerId);
            }
        });

        if (req.body.layerButton == 'delete') {
            Model.Datafile.destroy({
                where: {
                    id: datalayerIds
                }
            }).then(function(numOfDestroyed){
                console.log(numOfDestroyed)

                Model.Datalayer.destroy({
                    where: {
                        datafileId: datalayerIds
                    }
                }).then(function(numOfDestroyed){
                    console.log(numOfDestroyed)

                    // add message for deleted layers
                    res.redirect('/layers/'+ req.user.id);  
                })
            }); 
        } else {
            var req = {'user' : {'id' : req.user.id}, 'body':{'voxelname' : req.body.voxelname, 'datalayerIds': req.body.datalayerIds, voxelDensity: req.body.voxelDensity}};
            var datalayerIds = [];
            req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
                if(datalayerId !== ""){
                    datalayerIds.push(datalayerId);
                    }
                });

            processVoxels([datalayerIds, req], function(){}); 

            res.redirect('/voxels/'+ req.user.id);  
        }
    } else {
        console.log('select layers!!!!');
        res.locals.error_messages = req.flash('layerAlert');
        // req.flash('layerAlert', "You haven't selected layers to compute. Please select at least one layer");
        // flashHandler.trigger('flash', ['The file upload failed. Try a different file.'])


        // res.redirect('/layers/'+ req.user.id); 
        // res.redirect('/layers/'+ req.user.id, {warningMessage: "You haven't selected layers to compute. Please select at least one layer"});
        res.redirect('/layers/'+ req.user.id); 

    } 
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


module.exports.transformVoxels = function(req, res) {
    console.log(req.body)

    if  (req.body.datavoxelIds !== ''){
        var deleteId = parseInt(req.body.datavoxelIds);

        Model.Datavoxel.destroy({
            where: {
                id: deleteId
            }
        }).then(function(numOfDestroyed){
            console.log(numOfDestroyed)

            // add message for deleted layers
            res.redirect('/voxels/'+ req.user.id);  
        }); 

    } else {
        console.log('select layers!!!!');
        res.locals.error_messages = req.flash('layerAlert');
        // req.flash('layerAlert', "You haven't selected layers to compute. Please select at least one layer");
        // flashHandler.trigger('flash', ['The file upload failed. Try a different file.'])


        // res.redirect('/layers/'+ req.user.id); 
        // res.redirect('/layers/'+ req.user.id, {warningMessage: "You haven't selected layers to compute. Please select at least one layer"});
        res.redirect('/voxels/'+ req.user.id); 

    } 
}
