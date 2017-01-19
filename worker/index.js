var proc = require('./fileProcessor').processDatalayer;
process.on('message', (m) => {
    // var express = require('express');
    console.log('CHILD got message:', m);
    var req = m;
    var datalayerIds = [];
    req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
        if(datalayerId !== ""){
            datalayerIds.push(datalayerId);
        }
    });
    proc(datalayerIds, req, function (message) {
        process.send({ message: message });
    });
});

