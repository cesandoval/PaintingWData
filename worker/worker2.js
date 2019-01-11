var Channel = require('./channel'),
    proc = require('./fileProcessor').processDatalayer,
    pushShapes = require('./fileProcessor').pushShapes,
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

queue.watchStuckJobs(6000);

queue.on('ready', () => {
  // If you need to
  console.info('Queue is ready!');
});

queue.on('error', (err) => {
  // handle connection errors here
  console.error('There was an error in the main queue!');
  console.error(err);
  console.error(err.stack);
});

//data -> datalayerIds, and req
//done is callback
// function processVoxels(data, done) {
//   job = queue.create('computeVoxel', data)
//     .priority('critical')
//     .attempts(2)
//     .backoff(true)
//     .removeOnComplete(true)
//     .save((err) => {
//       if (err) {
//         console.error(err);
//         done(err);
//       }
//       if (!err) {
//         done('Voxel Added to the Queue');
//       }
//     });
//   var res = data[2];
//   job.on('complete', function(){
//     console.log('yayayayayaay')
//     // res.json({completed: true}); 
//   });
// }

// queue.process('computeVoxel', 3, (job, done) => {  
//   var data = job.data;
//   var datalayerIds = data[0];
//   var req = data[1];

//   proc(datalayerIds, req, function (message) {
//     console.log(message, 222222222222, '----------------')
//     done();
//   });
  
// });


// function processShapes(data, done) {
//   queue.create('saveLayer', data)
//     .priority('critical')
//     .attempts(2)
//     .backoff(true)
//     .removeOnComplete(true)
//     .save((err) => {
//       if (err) {
//         // console.log(util.inspect(data))
//         // console.log(done)
//         console.error(err);
//         done(err);
//       }
//       if (!err) {
//         done();
//       }
//     });
// }

// queue.process('saveLayer', 5, (job, done) => { 
//   var data = job.data;
//   var req = data;
//   // var res = data[1];
//   // console.log(data)
//   // console.log(JSON.parse(data))
//   pushShapes(req, function (message) {
//     console.log(message);
//   });
//   done();
// });

module.exports = {
  // processVoxels: processVoxels,
  // processShapes: processShapes,
  queue: queue
}
