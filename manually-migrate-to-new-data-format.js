var Model = require('./app/models'),
    async = require('async')


// UPDATE RASTERVAL OF ALL DATALAYERS TO 0, 1, 2, 3, ...
function updateDatalayersRasterval(callback){
    console.log("inside updateDatalayersRasterval");

    Model.Datalayer.findAll({

    }).then(function(result) {
        var numDatalayers = Object.keys(result).length;
        if (numDatalayers == 0){
            callback(null);
        }
        var numUpdated = 0;

        var counters = {}; // Dictionary mapping Datafile to Highest rasterval for that datafile
        for (var key in result) {
            var datalayerObj = result[key];
            if ( !(datalayerObj.datafileId in counters)) {
                counters[datalayerObj.datafileId] = -1;
            }
            counters[datalayerObj.datafileId] = counters[datalayerObj.datafileId] + 1;
            // console.log("counters: ", counters);
            // console.log("datalayerObj.id: ", datalayerObj.id);
            
            // Do the update for each datalayer
            Model.Datalayer.update(
                { rasterval: counters[datalayerObj.datafileId] },
                { where: { id: datalayerObj.id } }
            ).then(function(res) {
                numUpdated += 1;
                // console.log(numUpdated);
                if (numUpdated == numDatalayers) {
                    callback(null);        
                }
            })

        }
    });
}


// FIND DATALAYERS THAT ARE MISSING DATADBFS, BUILD AND SAVE MISSING DATADBFS FOR THEM
function dbfsForDatalayers(callback) {
    console.log("inside dbfsForDatalayers");
    Model.Datalayer.findAll({
        // Include associated things that datalayer 'has'
        include: [
            {
                model: Model.Datadbf,
            },
        ],
    }).then(function(result) {
        var numToUpdate = Object.keys(result).length;
        if (numToUpdate == 0) {
            callback(null);
        }
        var numUpdated = 0;
        // Iterate through all rows stored in Datalayers table
        for (var key in result) {
            var row = result[key];
            // Parse out the Datadbf property
            var dbfValue = row.dataValues.Datadbf;
            // If there is no Datadbf in this datalayer, then create the missing one, with appropriate properties
            if (dbfValue == null) {
                var dataDbf = Model.Datadbf.build();
                dataDbf.userId = row.userId;
                dataDbf.datalayerId = row.rasterval;
                dataDbf.datafileId = row.datafileId;
                dataDbf.properties = JSON.stringify(row.properties);
                dataDbf.save();
            }
            // console.log("updating Datadbfs");

            numUpdated += 1;
            if (numUpdated == numToUpdate) {
                callback(null);
            }
        }
    });
}

// UPDATE RASTERPROPERTY IN DATAJSON FOR ROWS THAT ARE MISSING IT
function rasterPropertiesForDatajsons(callback) {
    console.log('inside rasterPropertiesForDatajsons')
    // Find the datajson rows that are missing properties
    // Find the datavoxelIds that are in these rows
    var datajsonsWithoutPropertiesToDatavoxels = {}
    // Find the datafileIds that are in these rows
    var datajsonsWithoutPropertiesToDatafiles = {}

    Model.Datajson.findAll({}).then(function(result) {
        for (var key in result) {
            var datajsonObject = result[key].dataValues
            if (datajsonObject.rasterProperty == null) {
                // console.log("datajson", result[key].dataValues.id, "has null rasterProperty");
                datajsonsWithoutPropertiesToDatavoxels[datajsonObject.id] =
                    datajsonObject.datavoxelId
                datajsonsWithoutPropertiesToDatafiles[datajsonObject.id] =
                    datajsonObject.datafileId
            }
        }
        // console.log(
        //     'datajsonsWithoutPropertiesToDatavoxels: ',
        //     datajsonsWithoutPropertiesToDatavoxels
        // )
        // console.log(
        //     'datajsonsWithoutPropertiesToDatafiles: ',
        //     datajsonsWithoutPropertiesToDatafiles
        // )

        // Find the property that corresponds to a voxel
        var datavoxelToDatafileToProperty = {}
        Model.Datavoxel.findAll({
            include: [
                {
                    model: Model.Datafile,
                    include: [
                        {
                            model: Model.Datalayer,
                            limit: 1,
                        },
                    ],
                },
            ],
        }).then(function(result) {
            for (var key1 in result) {
                // console.log(result[key].dataValues.Datafiles);
                for (var key2 in result[key1].dataValues.Datafiles) {
                    var datafile = result[key1].dataValues.Datafiles[key2]

                    // If the datavoxel is one of the ones that connect to a datajson with no properties, then continue to deal with it
                    var datavoxelObjectId = result[key1].dataValues.id
                    if (
                        Object.values(
                            datajsonsWithoutPropertiesToDatavoxels
                        ).includes(datavoxelObjectId)
                    ) {
                        var property = datafile.Datalayers[0].rasterProperty
                        if (
                            !(
                                datavoxelObjectId in
                                datavoxelToDatafileToProperty
                            )
                        ) {
                            datavoxelToDatafileToProperty[
                                datavoxelObjectId
                            ] = {}
                        }
                        datavoxelToDatafileToProperty[datavoxelObjectId][
                            datafile.id
                        ] = property
                    }
                }
            }
            // console.log(
            //     'datavoxelToDatafileToProperty: ',
            //     datavoxelToDatafileToProperty
            // )

            // Use the datavoxelToProperties object
            // Update all datajsons that are missing, with the correctly formatted new rasterProperty
            var numToUpdate = Object.keys(datajsonsWithoutPropertiesToDatavoxels).length;
            if (numToUpdate == 0){
                callback(null);
            }
            var numUpdated = 0; 
            for (var k in datajsonsWithoutPropertiesToDatavoxels) {
                var firstKey = datajsonsWithoutPropertiesToDatavoxels[k]
                var secondKey = datajsonsWithoutPropertiesToDatafiles[k]
                var desiredProperty =
                    datavoxelToDatafileToProperty[firstKey][secondKey]

                Model.Datajson.update(
                    { rasterProperty: desiredProperty },
                    { where: { id: k } }
                ).then(function(result) {
                    console.log('updating datajson rasterProperty:', result)
                    numUpdated += 1;
                    if (numUpdated == numToUpdate) {
                        callback(null);    
                    }
                })
            }

        })
    })
}

function allDone(callback) {
    console.log("done running file");
}


// FUNCTION THAT IS RUN WHEN THIS FILE IS RUN
function runAll() {

    async.waterfall([
        updateDatalayersRasterval,
        dbfsForDatalayers,
        rasterPropertiesForDatajsons,
        allDone,
    ], function (err, result) {
    });    

}

runAll();
