var Model = require('./app/models');

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
// dbfsForDatalayers();


// UPDATE RASTERPROPERTY IN DATAJSON FOR ROWS THAT ARE MISSING IT
function rasterPropertiesForDatajsons() {

    // Find the datajson rows that are missing properties
    // Find the datavoxelIds that are in these rows
    datajsonsWithoutPropertiesToDatavoxels = {};
    // Find the datafileIds that are in these rows
    datajsonsWithoutPropertiesToDatafiles = {};

    Model.Datajson.findAll({
    }).then(function(result){

        for (var key in result) {
            var datajsonObject = result[key].dataValues;
            if (datajsonObject.rasterProperty == null) {
                // console.log("datajson", result[key].dataValues.id, "has null rasterProperty");
                datajsonsWithoutPropertiesToDatavoxels[ datajsonObject.id ] = datajsonObject.datavoxelId;
                datajsonsWithoutPropertiesToDatafiles[ datajsonObject.id ] = datajsonObject.datafileId;
            }
        }
        console.log("datajsonsWithoutPropertiesToDatavoxels: ", datajsonsWithoutPropertiesToDatavoxels);
        console.log("datajsonsWithoutPropertiesToDatafiles: ", datajsonsWithoutPropertiesToDatafiles);


        // Find the property that corresponds to a voxel
        datavoxelToDatafileToProperty = {};
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
                    if (Object.values(datajsonsWithoutPropertiesToDatavoxels).includes(datavoxelObjectId)){
                        var property = datafile.Datalayers[0].rasterProperty;
                        if ( !(datavoxelObjectId in datavoxelToDatafileToProperty)) {
                            datavoxelToDatafileToProperty[datavoxelObjectId] = {};
                        }
                        datafileToProperty = {};
                        datavoxelToDatafileToProperty[datavoxelObjectId][datafile.id] = property;
                    }
                }
            }
            console.log("datavoxelToDatafileToProperty: ", datavoxelToDatafileToProperty);

            // Use the datavoxelToProperties object
            // Update all datajsons that are missing, with the correctly formatted new rasterProperty
            for (var key in datajsonsWithoutPropertiesToDatavoxels) {
                var firstKey = datajsonsWithoutPropertiesToDatavoxels[key];
                var secondKey = datajsonsWithoutPropertiesToDatafiles[key];
                var desiredProperty = datavoxelToDatafileToProperty[firstKey][secondKey];

                Model.Datajson.update(
                    { rasterProperty:  desiredProperty },
                    { where: {id: key} }
                )
                .then(function(result) {
                    console.log("after update:", result);
                });
            }

            console.log("done going through datajsons");
    
    })


    

    })

}
// rasterPropertiesForDatajsons();


// FUNCTION THAT IS RUN WHEN THIS FILE IS RUN
function runAll() {
    console.log("starting run-me.js");
    var promise = new Promise(function() {
        dbfsForDatalayers();
        rasterPropertiesForDatajsons();    
    });
    promise.then(function(result) {
        console.log("done running run-me.js");
    });
}

runAll();

