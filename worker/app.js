//Lets require/import the HTTP module
var express = require('express');
var app = express();
var db = require('../app/models');
var layerController = require('../app/controllers/datalayerController');

var q = 'layer_tasks';

function consumer(conn, callback) {
  console.log("in this file... ");
  var ok = conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.consume(q, function(msg) {
      if (msg !== null) {
        var recievedMsg = msg.content.toString();
        console.log('in test worker, recieved the message: ', recievedMsg);
        var req = JSON.parse(recievedMsg);
        var datalayerIds = [];
        var datalayerIdString = req.body.datalayerIds;
        req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
            if(datalayerId !== ""){
                datalayerIds.push(datalayerId);
            }
        });
        layerController.startWorker(datalayerIds, req);
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  }
}

function testWorker(){
  require('amqplib/callback_api')
    .connect('amqp://localhost', function(err, conn) {
      if (err != null) bail(err);
      consumer(conn);
    });
}



app.get('/', function (req, res) {
  testWorker();
  res.send('Hello World!')
});

app.listen(8899, function () {
  console.log('Example app listening on port 3000!')
});






