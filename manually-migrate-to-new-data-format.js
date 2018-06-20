var Model = require('./app/models')

// UPDATE RASTERVAL OF ALL DATALAYERS TO 0, 1, 2, 3, ...
function updateDatalayersRasterval(){
    Model.Datalayer.findAll({

    }).then(function(result)) {
        for (var key in result) {
            var datalayerObj = result[key];
            var counters = {}; // dictionary mapping Datafile to Highest rasterval for that datafile
            if ( !(datalayerObj.datafileId in counters)) {
                counters[datalayerObj.datafileId] = -1;
            }
            counters[datalayerObj.datafileId] = counters[datalayerObj.datafileId] + 1;
            
            // do the update
            Model.Datajson.update(
                { rasterval: counters[datalayerObj.datafileId] },
                { where: { id: datalayerObj.id } }
            ).then(function(result) {
                // console.log('after update:', result)
            })

        }
    }
}


// FIND DATALAYERS THAT ARE MISSING DATADBFS, BUILD AND SAVE MISSING DATADBFS FOR THEM
function dbfsForDatalayers() {
    Model.Datalayer.findAll({
        // Include associated things that datalayer 'has'
        include: [
            {
                model: Model.Datadbf,
            },
        ],
    }).then(function(result) {
        // Iterate through all rows stored in Datalayers table
        for (var key in result) {
            var row = result[key]
            // Parse out the Datadbf property
            var dbfValue = row.dataValues.Datadbf
            // If there is no Datadbf in this datalayer, then create the missing one, with appropriate properties
            if (dbfValue == null) {
                var dataDbf = Model.Datadbf.build()
                dataDbf.userId = row.userId
                dataDbf.datalayerId = row.rasterval
                dataDbf.datafileId = row.datafileId
                dataDbf.properties = JSON.stringify(row.properties)
                dataDbf.save()
            }
        }
        console.log('done going through datalayers')
    })
}
// dbfsForDatalayers();

// UPDATE RASTERPROPERTY IN DATAJSON FOR ROWS THAT ARE MISSING IT
function rasterPropertiesForDatajsons() {
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
        console.log(
            'datajsonsWithoutPropertiesToDatavoxels: ',
            datajsonsWithoutPropertiesToDatavoxels
        )
        console.log(
            'datajsonsWithoutPropertiesToDatafiles: ',
            datajsonsWithoutPropertiesToDatafiles
        )

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
            console.log(
                'datavoxelToDatafileToProperty: ',
                datavoxelToDatafileToProperty
            )

            // Use the datavoxelToProperties object
            // Update all datajsons that are missing, with the correctly formatted new rasterProperty
            for (var k in datajsonsWithoutPropertiesToDatavoxels) {
                var firstKey = datajsonsWithoutPropertiesToDatavoxels[k]
                var secondKey = datajsonsWithoutPropertiesToDatafiles[k]
                var desiredProperty =
                    datavoxelToDatafileToProperty[firstKey][secondKey]

                Model.Datajson.update(
                    { rasterProperty: desiredProperty },
                    { where: { id: k } }
                ).then(function(result) {
                    console.log('after update:', result)
                })
            }

            console.log('done going through datajsons')
        })
    })
}
// rasterPropertiesForDatajsons();

// FUNCTION THAT IS RUN WHEN THIS FILE IS RUN
function runAll() {
    console.log('starting manually-migrate-to-new-data-format.js');
    var promiseOne = new Promise(function() {
        var promiseTwo = new Promise(function() {
            updateDatalayersRasterval();
        })
        promiseTwo.then(function() {
            console.log('done updateDatalayersRasterval');
            dbfsForDatalayers();
            rasterPropertiesForDatajsons();    
        })
    })
    promiseOne.then(function() {
        console.log('done dbfsForDatalayers');
        console.log('done rasterPropertiesForDatajsons');
        console.log('done manually-migrate-to-new-data-format.js');
    })
}

runAll()
