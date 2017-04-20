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