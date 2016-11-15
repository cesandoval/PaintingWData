// Express
var express = require('express');
var router = express.Router();

var DataJSON = require('../sequelize').import('../models/datajson');

// Defines the routes to create using the generic route factory
// Good for routes 
const ROUTES = [
    {
        name: '/one',
        func: 'findOne'
    },
    {
        name: '/all',
        func: 'findAll'
    },
    {
        name: '/count',
        func: 'count'
    },
    {
        name: '/findcount',
        func: 'findAndCount'
    },
    {
        name: '/findinitialize',
        func: 'findOrInitialize'
    },
    {
        name: '/findcreate',
        func: 'findOrCreate'
    },
];
// Function that will catch errors
// Will respond with 500 code and reason for error
// Reason is reason given by Model query promise
function catchError(res, reason){
    res.status(500).send('Query failed for ' + reason);
}


// Call a query for a single object
router.get('/:id', function(req, res){
    // Get id from URL
    var id = req.params.id;

    // Query the Database, using promises to return data
    DataJSON.findById(id)
        .then(res.send.bind(res))
        .catch(catchError.bind(null, res));

});

// Generic Route Factory
// For routes which query and return some data
ROUTES.forEach(function(route){
    // Call a query for one object, passing options
    router.post(route.name, function(req, res){
        // Options parameter
        var options = req.body.options;

        // Query the Database, using promises to return data
        DataJSON[route.func](options)
            .then(res.send.bind(res))
            .catch(catchError.bind(null, res));
    });
});


// TODO: Something with aggregate methods?
//        - Doing some sort of search?
//        - Finding mix/max of something?
//        - Closest number?
// TODO: If there are multiple functions, use the same generic
// constructor format as ROUTES

// Call a query for a single object
//router.get('/aggregate', function(req, res){
    // TODO
//});

// TODO: Add functions that create data

// Make sure all the fields present
function testDataJSONFields(potentialEntry){
    if(potentialEntry.layername == null) return false;
    if(potentialEntry.layerids== null) return false;
    if(potentialEntry.geojson == null) return false;
    if (potentialEntry.epsg == null) return false;
    return true;
}

// Create an instance of DataJSON
router.post('/build', function(req, res){
    // New Entry
    var entry = req.body.entry;

    // Test Fields and send
    if (testDataJSONFields(entry)){
        DataJSON.create(entry)
            .then(res.send.bind(res))
            .catch(catchError.bind(null, res));
    } else {
        res.status(500).send("All fields not present")
    }
});

// Return Router
module.exports = router;
