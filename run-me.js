console.log("-beginning of file");


var Model = require('./app/models');


// function showVoxels() {
//     Model.Datavoxel.findAll({
//            where : {
//                userId : 1,
//                processed : true,
//                deleted: {$not: true}
//            },
//            include: [
//                {
//                model: Model.Datafile, 
//                include: [
//                    {
//                        model: Model.Datalayer,
//                        limit: 1
//                    },
//                    {
//                        model: Model.Datadbf,
//                        limit: 1
//                    },
//                ]                        
//                },
//                {
//                    model: Model.Datajson,
//                    attributes: ["rasterProperty"] 
//                }
//            ]
//        }).then(function(datavoxels){
//            console.log(datavoxels)
//        });
// }
// showVoxels();

// function foo() {
//     Model.Datafile.findAll({
//         include: [
//             {
//                 model: Model.Datalayer,
//                 limit: 1
//             }
//         ]
//     }).then(function(result) {
//         console.log(result[0].dataValues);
//     });
// }
// foo();

// FIND WHICH DATALAYERS ARE MISSING A DATADBF
// function foo() {
//     Model.Datalayer.findAll({
//         include: [
//             {
//                 model: Model.Datadbf,
//             }
//         ],
//         // limit: 386
//     }).then(function(result) {
//         // console.log(result);
//         for (var key in result) {
//             // console.log("Datadbf: ", result[key].dataValues.Datadbf);
//             var dbfValue = result[key].dataValues.Datadbf;
//             if (dbfValue == null) {
//                 console.log("datalayer", result[key].id, "has no datadbf associated");
//             }
//         }
//         console.log(result.length);
//     });
// }
// foo();



// DELETE ALL DATALAYERS PAST A WITH A CERTAIN DATAFILEID
// function foo() {
//     Model.Datalayer.destroy({
//         where: {
//             datafileId: 2
//         }
//         // limit: 386
//     }).then(function(result) {
//         console.log(result);
//         console.log(result.length);
//     });
// }
// foo();


// // FIND DATALAYERS THAT ARE MISSING DATADBFS, BUILD AND SAVE MISSING DATADBFS FOR THE FIRST 200 FOUND
// function foo() {
//     Model.Datalayer.findAll({
//         // Include associated things that datalayer 'has'
//         include: [
//             {
//                 model: Model.Datadbf,
//             }
//         ],
//         limit: 200
//     }).then(function(result) {
//         // Iterate through all rows stored in Datalayers table
//         for (var key in result) {
//             var row = result[key];
//             // Parse out the Datadbf property
//             var dbfValue = row.dataValues.Datadbf;
//             // If there is no Datadbf in this datalayer... 
//             if (dbfValue == null) {
//                 console.log("datalayer", key, "has no datadbf associated");
                
//                 // console.log("userId: ",row.userId);
//                 // console.log("datalayerId: ",row.rasterval);
//                 // console.log("datafileId: ", row.datafileId);
//                 // console.log("properties: ", row.properties);

//                 dataDbf = Model.Datadbf.build();
//                 dataDbf.userId = row.userId;
//                 dataDbf.datalayerId = row.rasterval;
//                 dataDbf.datafileId = row.datafileId;
//                 dataDbf.properties = row.properties;
//                 dataDbf.save();
                
//             }
//         }
//     });
// }
// foo();


// // FIND DATALAYERS THAT ARE MISSING DATADBFS, BUILD AND SAVE MISSING DATADBFS FOR THEM
// function dbfsForDatalayers() {
//     Model.Datalayer.findAll({
//         // Include associated things that datalayer 'has'
//         include: [
//             {
//                 model: Model.Datadbf,
//             }
//         ],
//         // limit: 200
//     }).then(function(result) {
//         // Iterate through all rows stored in Datalayers table
//         for (var key in result) {
//             var row = result[key];
//             // Parse out the Datadbf property
//             var dbfValue = row.dataValues.Datadbf;
//             // If there is no Datadbf in this datalayer, then create the missing one, with appropriate properties
//             if (dbfValue == null) {
//                 dataDbf = Model.Datadbf.build();
//                 dataDbf.userId = row.userId;
//                 dataDbf.datalayerId = row.rasterval;
//                 dataDbf.datafileId = row.datafileId;
//                 dataDbf.properties = JSON.stringify(row.properties);
//                 dataDbf.save();
                
//             }
//         }
//         console.log("done going through datalayers");
//     });
// }
// dbfsForDatalayers();



function rasterPropertiesForDatajsons() {
    datajsonsWithoutPropertiesToDatavoxels = {};
    Model.Datajson.findAll({
    }).then(function(result){
        for (var key in result) {
            var datajsonObject = result[key].dataValues;
            if (datajsonObject.rasterProperty == null) {
                // console.log("datajson", result[key].dataValues.id, "has null rasterProperty");
                datajsonsWithoutPropertiesToDatavoxels[ datajsonObject.id ] = datajsonObject.datavoxelId;
            }
        }
        console.log(datajsonsWithoutPropertiesToDatavoxels);


        datavoxelToProperties = {};
        Model.Datavoxel.findAll({
               include: [
                   {
                    model: Model.Datafile, 
                    include: [
                        {
                            model: Model.Datalayer,
                            limit: 1
                        },
                    ]                        
                   },
               ]    
        }).then(function(result){
            for (var key in result) {
                // console.log(result[key].dataValues.Datafiles);
                for (var key2 in result[key].dataValues.Datafiles) {
                    datafile = result[key].dataValues.Datafiles[key2];
    
                    var datavoxelObjectId = result[key].dataValues.id;
                    if (datavoxelObjectId in Object.values(datajsonsWithoutPropertiesToDatavoxels)){
                        var property = datafile.Datalayers[0].rasterProperty;
                        if ( !(datavoxelObjectId in datavoxelToProperties)) {
                            datavoxelToProperties[datavoxelObjectId] = "";
                        }
                        datavoxelToProperties[datavoxelObjectId] += property + ",";    
                    }
                }
            }
            console.log(datavoxelToProperties);

            for (key in datavoxelToProperties) {
                value = datavoxelToProperties[key];
                result = {};
                list = value.split(",");
                list.pop();
                i = 1;
                for (var a in list) {
                    result[i] = list[a];
                    i += 1;
                }
                datavoxelToProperties[key] = result;
            }
            console.log(datavoxelToProperties);
    
    
            for (var key in datajsonsWithoutPropertiesToDatavoxels) {
                var datajsonWithoutProperties = datajsonsWithoutPropertiesToDatavoxels[key];
                Model.Datajson.update(
                    { rasterProperty:  JSON.stringify(datavoxelToProperties[datajsonsWithoutPropertiesToDatavoxels[key]]) },
                    { where: {id: key} }
                )
                .then(function(result) {
                    console.log("after update:", result);
                });
            }
    
    })


    

    })

}
rasterPropertiesForDatajsons();

// Model.Datajson.update(
//     { rasterProperty: null },
//     { where: { id: 3 } }
// ).then(function(result) {
//     console.log("huh: ", result);
//     console.log("hello");
// });




console.log("-end of file");