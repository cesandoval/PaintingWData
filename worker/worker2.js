var Channel = require('./channel'),
    proc = require('./fileProcessor').processDatalayer,
    pushTheShapes = require('./fileProcessor').pushShapes,
    util = require('util');

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
  var data = job.data;
  var datalayerIds = data[0];
  var req = data[1];
  
  proc(datalayerIds, req, function (message) {
    console.log(message);
  }); 
  done();
});


function processShapes(data, done) {
  // console.log(data)
  // data = util.inspect(data);
  // console.log(data[0])
  queue.create('saveLayer', data)
    .priority('critical')
    .attempts(2)
    .backoff(true)
    .removeOnComplete(true)
    .save((err) => {
      if (err) {
        console.log(999999999)
        // console.log(util.inspect(data))
        // console.log(done)
        console.error(err);
        done(err);
      }
      if (!err) {
        done();
      }
    });
}

queue.process('saveLayer', (job, done) => { 
  var data = job.data;
  var req = data;
  // var res = data[1];
  console.log(888888888888)
  // console.log(data)
  // console.log(JSON.parse(data))
  pushTheShapes(req, function (message) {
    console.log(message);
  }); 
  done();
});

module.exports = {
  processVoxels: processVoxels,
  processShapes: processShapes
}