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


// FIND DATALAYERS THAT ARE MISSING DATADBFS, BUILD AND SAVE MISSING DATADBFS FOR THEM
function dbfsForDatalayers() {
    Model.Datalayer.findAll({
        // Include associated things that datalayer 'has'
        include: [
            {
                model: Model.Datadbf,
            }
        ],
    }).then(function(result) {
        // Iterate through all rows stored in Datalayers table
        for (var key in result) {
            var row = result[key];
            // Parse out the Datadbf property
            var dbfValue = row.dataValues.Datadbf;
            // If there is no Datadbf in this datalayer, then create the missing one, with appropriate properties
            if (dbfValue == null) {
                dataDbf = Model.Datadbf.build();
                dataDbf.userId = row.userId;
                dataDbf.datalayerId = row.rasterval;
                dataDbf.datafileId = row.datafileId;
                dataDbf.properties = JSON.stringify(row.properties);
                dataDbf.save();
                
            }
        }
        console.log("done going through datalayers");
    });
}
dbfsForDatalayers();


// UPDATE RASTERPROPERTY IN DATAJSON FOR ROWS THAT ARE MISSING IT
function rasterPropertiesForDatajsons() {

    // Find the datajson rows that are missing properties
    // Find the datavoxelIds that are in these rows
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
        console.log("datajsonsWithoutPropertiesToDatavoxels: ", datajsonsWithoutPropertiesToDatavoxels);

        // Find the property that corresponds to a voxel
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
    
                    // If the datavoxel is one of the ones that connect to a datajson with no properties, then continue to deal with it
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
            console.log("datavoxelToProperties: ", datavoxelToProperties);

            // Change the dictionary of ids to string (comma-separated-words)
            // into a dictionary of ids to dictionary (each value is a different property)
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
            console.log("datavoxelToProperties: ", datavoxelToProperties);
    
            // Use the datavoxelToProperties object
            // Update all datajsons that are missing, with the correctly formatted new rasterProperty
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




console.log("-end of file");