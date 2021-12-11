const amqp = require('amqplib');
const path = require('path');
const fs = require('fs');
const { transporter } = require('./config/mailer');

amqp
  .connect('amqp://localhost')
  .then((conn) => {
    return conn.createChannel();
  })
  .then((ch) => {
    const queueName = 'SIGNUP_NOTIFICATION_EMAIL';

    ch.assertQueue(queueName, { durable: false });

    ch.prefetch(1);

    ch.consume(queueName, async (msg) => {
      const message = JSON.parse(msg.content.toString());

      const emailTemplatePath = path.join(__dirname, '..', 'email-templates');

      const emailTemplate = fs.readFileSync(
        `${emailTemplatePath}/${message.emailTemplateFileName}`
      );

      const send = transporter.templateSender(
        {
          subject: message.subject,
          html: emailTemplate,
        },
        { from: message.from }
      );

      send(
        {
          to: message.email,
        },
        {
          name: message.name,
          company: message.company,
          reset_link: message.reset_link,
          unsubscribe: message.unsubscribe,
        },
        function (err, info) {
          if (err) {
            console.log('Error');
            ch.ackAll(msg);
          } else {
            console.log('Email sent: ' + info.response);
            ch.ack(msg);
          }
        }
      );
    });
  });
