var amqp = require('amqplib/callback_api');

var url = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';

module.exports = createQueueChannel;
var kue = require('kue');

function createQueueChannel(queue, cb) {
	
}
