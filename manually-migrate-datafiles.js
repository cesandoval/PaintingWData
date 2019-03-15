var Model = require('./app/models'),
    async = require('async')


// UPDATE DATAFILE NAME 
function updateDatafiles(callback){
    console.log("inside updateDatafiles");

    Model.Datafile.findAll({
        // where : {
        //     userId : req.user.id,
        //     deleted: {$not: true}
        // },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
        }).then(function(datafiles){
            // console.log(datafiles)
            for (let i in datafiles) {
                let currDatafile = datafiles[i]
                if (currDatafile.userFileName == null) {
                    if (typeof currDatafile.Datalayers[0] != 'undefined'){
                        var description = currDatafile.Datalayers[0].description
                        var userLayerName = currDatafile.Datalayers[0].userLayerName
                    } else {
                        var description = null
                        var userLayerName = ''
                    }
                    console.log(userLayerName, description)
                    currDatafile.update(
                        { userFileName: userLayerName, description: description },
                    ).then(function(result) {
                        console.log('updating datafile names:', result)
                    })
                }
            }
        });
}




// FUNCTION THAT IS RUN WHEN THIS FILE IS RUN
function runAll() {
    async.waterfall([
        updateDatafiles,
    ], function (err, result) {
        console.log(err, result);
    });    
}

runAll();
