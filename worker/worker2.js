var Channel = require('./channel'),
    proc = require('./fileProcessor').processDatalayer;

var redisConfig;  

var RedisServer = require('redis-server');
 
// Simply pass the port that you want a Redis server to listen on.
var server = new RedisServer(6379);
 
server.open((err) => {
  if (err === null) {
    console.log("redis server connected")
    // You may now connect a client to the Redis
    // server bound to `server.port` (e.g. 6379).
  }
});


if (process.env.NODE_ENV === 'production') {  
  redisConfig = {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      auth: process.env.REDIS_PASS
    }
  };
} else {
  redisConfig = {
    redis: {
      port: 6379
    }
  };
}

var kue = require('kue'), 
queue = kue.createQueue(redisConfig);

//data -> datalayerIds, and req
//done is callback
function processVoxels(data, done) {  
  queue.create('computeVoxel', data)
    .priority('critical')
    .attempts(2)
    .backoff(true)
    .removeOnComplete(true)
    .save((err) => {
      if (err) {
        console.error(err);
        done(err);
      }
      if (!err) {
        done();
      }
    });
}

queue.process('computeVoxel', (job, done) => {  
  // This is the data we sent into the #create() function call earlier
  // We're setting it to a constant here so we can do some guarding against accidental writes
  var data = job.data;
  var datalayerIds = data[0];
  var req = data[1];
  
  proc(datalayerIds, req, function (message) {
    console.log(message);
  }); 
  done();
});

module.exports = {
  processVoxels: processVoxels
}



// Channel(queue, function(err, channel, conn) {  
//   if (err) {
//     console.error(err.stack);
//   }
//   else {
//     console.log('channel and queue created');
//     consume();
//   }

//   function consume() {
//     channel.get(queue, {}, onConsume);

//     function onConsume(err, msg) {
//       if (err) {
//         console.warn(err.message);
//       }
//       else if (msg) {
//         console.log('OTHER CHILD got message:', JSON.parse(msg.content.toString()));
//         var req = JSON.parse(msg.content.toString());
//         var datalayerIds = [];
//         req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
//             if(datalayerId !== ""){
//                 datalayerIds.push(datalayerId);
//             }
//         });
//         console.log(datalayerIds);

//         proc(datalayerIds, req, function (message) {
//             console.log(message);
//         });
        

                
//         setTimeout(function() {
//           channel.ack(msg);
//           consume();
//         }, 1e4);
//       }
//       else {
//         console.log('no message, waiting...');
//         setTimeout(consume, 1e3);
//       }
//     }
//   }

// });