var Channel = require('./channel'),
    proc = require('./fileProcessor').processDatalayer;

var queue = 'queue';

Channel(queue, function(err, channel, conn) {  
  if (err) {
    console.error(err.stack);
  }
  else {
    console.log('channel and queue created');
    consume();
  }

  function consume() {
    channel.get(queue, {}, onConsume);

    function onConsume(err, msg) {
      if (err) {
        console.warn(err.message);
      }
      else if (msg) {
        console.log('OTHER CHILD got message:', JSON.parse(msg.content.toString()));
        var req = JSON.parse(msg.content.toString());
        var datalayerIds = [];
        req.body.datalayerIds.split(" ").forEach(function(datalayerId, index){
            if(datalayerId !== ""){
                datalayerIds.push(datalayerId);
            }
        });
        console.log(datalayerIds);

        proc(datalayerIds, req, function (message) {
            console.log(message);
        });
        

                
        setTimeout(function() {
          channel.ack(msg);
          consume();
        }, 1e3);
      }
      else {
        console.log('no message, waiting...');
        setTimeout(consume, 1e3);
      }
    }
  }
});