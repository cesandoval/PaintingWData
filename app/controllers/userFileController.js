var Model = require('../models'),
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app');

module.exports.save = function(req, res){
    Model.Datauserfile.create({
        state: req,
    });
}
