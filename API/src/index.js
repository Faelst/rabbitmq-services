const express = require('express');
const app = express();

const queue = require('./queues/index');
const amqpClient = require('./config');

app.use(express.static('public'));
app.use(express.json());

let channel;
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
amqpClient
  .createClient({ url: 'amqp://localhost' }, REPLY_QUEUE)
  .then((ch) => (channel = ch));

app.get('/', (req, res) => {
  res.send('Api is running!');
});

let i = 1;
app.post('/task', (req, res) => {
  i = i + 1;
  queue.sendToQueue('fila1', { i, ...req.body });
  res.json({ message: 'Your request will be processed!' });
});

app.post('/send-email', (req, res) => {
  queue
    .sendRPCMessage(
      channel,
      JSON.stringify(req.body),
      'SIGNUP_NOTIFICATION_EMAIL'
    )
    .catch((err) => {
      console.log('err', err);
    });

  res.json({ message: 'Email has been send!' });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
