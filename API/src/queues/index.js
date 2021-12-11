'use strict';
const amqp = require('amqplib');
const EventEmitter = require('events');

// this queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

/**
 * Create amqp channel and return back as a promise
 * @params {Object} setting
 * @params {String} setting.url
 * @returns {Promise} - return amqp channel
 */
const createClient = (setting) =>
  amqp
    .connect(setting.url)
    .then((conn) => conn.createChannel()) // create channel
    .then((channel) => {
      channel.responseEmitter = new EventEmitter();
      channel.responseEmitter.setMaxListeners(0);
      channel.consume(
        REPLY_QUEUE,
        (msg) =>
          channel.responseEmitter.emit(
            msg.properties.correlationId,
            msg.content
          ),
        { noAck: true }
      );
      return channel;
    });

const sendRPCMessage = (channel, message, rpcQueue) =>
  new Promise((resolve) => {
    // unique random string
    const correlationId = generateUuid();

    channel.responseEmitter.once(correlationId, resolve);

    channel.sendToQueue(rpcQueue, Buffer(message), {
      correlationId,
      replyTo: REPLY_QUEUE,
    });
  });

function generateUuid() {
  return (
    Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
  );
}

module.exports.createClient = createClient;
module.exports.sendRPCMessage = sendRPCMessage;
