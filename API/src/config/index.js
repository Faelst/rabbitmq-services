const amqp = require('amqplib');
const EventEmitter = require('events');

const createClient = (setting, REPLY_QUEUE) =>
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

module.exports = { createClient };
