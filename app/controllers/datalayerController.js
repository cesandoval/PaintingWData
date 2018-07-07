var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    Channel = require('../../worker/channel');
    processVoxels = require('../../worker/worker2').processVoxels;

/**
 * Handles creation of voxels from the datalayers that the user selects.
 * Redirects to /voxels page.
 * Also handles if the user deletes datalayers from the /layers page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.computeVoxels = function(req, res){
    console.log("req.body: ", req.body);
    if (req.body.datalayerIds == '{}'){
        console.log('select properties!!!!');
        req.flash('layerAlert', "You haven't selected a property. Please select at least one property.");
        res.redirect('/layers/'+ req.user.id);
    }
    else if  (req.body.datalayerIds !== ''){
        // parses into a datalayerIds list
        var datalayerIds = [];

        var datalayerIdsAndRasterValsObject = {};
        var unparsed = JSON.parse(req.body.datalayerIds); // ex: {3: 'OBJECT_ID', 4: 'MedHomeValue'}
        // Add a hash to each object property
        for (var key in unparsed) {
            var timestampHash = 0;
            var properties = unparsed[key].split(";");
            console.log("properties: ", properties);
            for (var i = 0; i < properties.length; i++) {
                datalayerIdsAndRasterValsObject[ key + ".." + timestampHash ] = properties[i];
                // datalayerIdsAndRasterValsObject[ key ] = properties[i];
                timestampHash += 1;
            } 
        }
        console.log(".datalayerIdsAndRasterValsObject: ", datalayerIdsAndRasterValsObject);


        for (datalayerId in datalayerIdsAndRasterValsObject){
            datalayerIds.push(datalayerId);
        }

        console.log("datalayerIds: ", datalayerIds);

        // handles deleting layer(s)
        if (req.body.layerButton == 'delete') {
            // delete relevant datafile
            Model.Datafile.update({
                deleted: true
            }, {
                where: {
                    id: datalayerIds
                }
            }).then(function(){
                // delete relevant datalayers
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
            // handles creating a voxel, using one or more datalayers, redirects to /voxels/ url after completed
            var req = {'user' : {'id' : req.user.id}, 'body':{'voxelname' : req.body.voxelname, 'datalayerIds': req.body.datalayerIds, voxelDensity: req.body.voxelDensity, 'datalayerIdsAndProps': datalayerIdsAndRasterValsObject}};
            var datalayerIds = [];
            // var datalayerIdsAndRasterValsObject = JSON.parse(req.body.datalayerIds);
            var datalayerIdsAndRasterValsObject = {};
            var unparsed = JSON.parse(req.body.datalayerIds); // ex: {3: 'OBJECT_ID', 4: 'MedHomeValue'}
            // Add a hash to each object property
            for (var key in unparsed) {
                var timestampHash = 0;
                var properties = unparsed[key].split(";");
                console.log("properties: ", properties);
                for (var i = 0; i < properties.length; i++) {
                    datalayerIdsAndRasterValsObject[ key + ".." + timestampHash ] = properties[i];
                    // datalayerIdsAndRasterValsObject[ key ] = properties[i];
                    timestampHash += 1;
                } 
            }    
            console.log("datalayerIdsAndRasterValsObject: ", datalayerIdsAndRasterValsObject);
            
            for (datalayerId in datalayerIdsAndRasterValsObject){
                datalayerIds.push(datalayerId);
            }
    

            processVoxels([datalayerIds, req], function(){}); 

            res.redirect('/voxels/'+ req.user.id + '/' + req['voxelID'] + "$$" + datalayerIds.join("$$"));
        }
    } 

    // no layers were selected
    else {
        console.log('select layers!!!!');
        req.flash('layerAlert', "You haven't selected layers. Please select at least one layer.");
        res.redirect('/layers/'+ req.user.id);
    }
};

/**
 * Handles displaying of all datafiles that
 *  (1) are owned by the user and
 *  (2) are not deleted
 * Renders at /layers page 
 * Passes on relevant datafiles to layers.jade 
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.show = function(req, res) {
    Model.Datafile.findAll({
        where : {
            userId : req.user.id,
            deleted: {$not: true}
        },
        include: [{
            model: Model.Datalayer,
            limit: 1},
            {
            model: Model.Datadbf,
            limit: 1}]
        }).then(function(datafiles){
            
            res.render('layers', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user, layerAlert: req.flash('layerAlert')[0]});
        });
}

module.exports.showDatasets = function(req, res) {
    Model.Datafile.findAll({
        where : {
            userId : req.user.id,
            deleted: {$not: true}
        },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
        }).then(function(datafiles){

            res.render('datasets', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user, layerAlert: req.flash('layerAlert')[0]});
        });
}

/* TODO(CreateProject)
module.exports.showDatasets = function(req, res) {
    Model.Datafile.findAll({
        where : {
            userId : req.user.id,
            deleted: {$not: true}
        },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
        }).then(function(datafiles){

            res.render('createProject', {id: req.params.id, datafiles : datafiles, userSignedIn: req.isAuthenticated(), user: req.user, layerAlert: req.flash('layerAlert')[0]});
        });
}
*/

/**
 * Handles displaying all voxels that
 *  (1) are owned by the user
 *  (2) are not deleted and
 *  (3) have completed being processed
 * Renders at /voxels page.
 * Passes on datavoxels to voxels.jade
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.showVoxels= function(req, res) {
     Model.Datavoxel.findAll({
            where : {
                userId : req.user.id,
                processed : true,
                deleted: {$not: true}
            },
            include: [
                {
                model: Model.Datafile, 
                include: [
                    {
                        model: Model.Datalayer,
                        limit: 1
                    },
                    {
                        model: Model.Datadbf,
                        limit: 1
                    },
                ]                        
                },
                {
                    model: Model.Datajson,
                    attributes: ["rasterProperty", "datafileId"] 
                }
            ]
        }).then(function(datavoxels){
            // console.log("datavoxels: ", datavoxels);
            for (var key in datavoxels) {
                var datavoxel = datavoxels[key];
                console.log("datavoxel.Datajsons: ", datavoxel.Datajsons);
            }
            res.render('voxels', {id: req.params.id, datavoxels : datavoxels, userSignedIn: req.isAuthenticated(), user: req.user, voxelAlert: req.flash('voxelAlert')[0]});
        });
}


/**
 * Handles display of a voxel for the voxel that the user selects to open.
 * Redirects to /app/{voxelID} page.
 * Also handles if the user deletes voxels from the /voxels page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.transformVoxels = function(req, res) {
    console.log(req.body)

    if  (req.body.datavoxelIds !== ''){
        var voxelId = parseInt(req.body.datavoxelIds);
        
        // handles displaying of a voxel
        if (req.body.layerButton == 'open') {
            res.redirect('/app/'+ voxelId);

        } 

        // handles deleting of a voxel
        else{
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

        // if no layers were selected at all
        req.flash('voxelAlert', "You haven't selected a Voxel. Please select a Voxel.");
        res.redirect('/voxels/'+ req.user.id);

    }
}

module.exports.showProjects= function(req, res) {
    Model.Datavoxel.findAll({
           where : {
               userId : req.user.id,
               processed : true,
               deleted: {$not: true}
           },

           include: [{
               model: Model.Datafile, 

               include: [
                    {
                        model: Model.Datalayer,
                        limit: 1
                    },
                    {
                        model: Model.Datadbf,
                        limit: 1
                    },
                ]                        

                }, {
                model: Model.Datavoxelimage
                }, {
                    model: Model.Datajson,
                    attributes: ["rasterProperty", "datafileId","layername"] 
                }
            ]
       }).then(function(datavoxels){
           console.log("------------------------------------------------");
           res.render('projects', {id: req.params.id, datavoxels : datavoxels, userSignedIn: req.isAuthenticated(), user: req.user, voxelAlert: req.flash('voxelAlert')[0]});
       });
}


module.exports.transformProjects = function(req, res) {
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
               res.redirect('/projects/'+ req.user.id);
           });
       }
   } else {
       console.log('select layers!!!!');

       req.flash('voxelAlert', "You haven't selected a Voxel. Please select a Voxel.");
       res.redirect('/voxels/'+ req.user.id);

   }
}

/*
A helper function to generate a voxel hash; an ID.
*/
function hash(){
    return (+new Date()).toString(32) + Math.floor(Math.random()*36).toString(36);
}
