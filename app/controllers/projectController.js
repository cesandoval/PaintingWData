var Model = require('../models')

module.exports.showAllPublicProjects= function(req, res) {
    Model.Datavoxel.findAll({
           where : {
               public : true,
               processed : true,
               deleted: {$not: true}
           },

           include: [{
                model: Model.Datavoxelimage
                }, {
                    model: Model.Datajson,
                    attributes: ["rasterProperty", "datafileId","layername"] 
                }
            ]
       }).then(function(datavoxels){
           console.log("----------------PUBLIC PROJECTS SENT--------------------------------");
           res.render('projects', {id: req.params.id, datavoxels : datavoxels, userSignedIn: req.isAuthenticated(), user: req.user, voxelAlert: req.flash('voxelAlert')[0]});
       });
}

