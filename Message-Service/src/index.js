const amqp = require('amqplib');
const path = require('path');
const fs = require('fs');
const { transporter } = require('./config/mailer');

amqp
  .connect('amqp://localhost')
  .then((conn) => {
    console.log('-- Service Message.emailSettings-Service is Running --');
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
        `${emailTemplatePath}/${message.emailSettings.emailTemplateFileName}`
      );

      const send = transporter.templateSender(
        {
          subject: message.emailSettings.subject,
          html: emailTemplate,
        },
        { from: message.emailSettings.from }
      );

      send(
        {
          to: message.emailSettings.to,
        },
        {
          ...message.emailSettings.templateVariables,
        },
        (err, info) => {
          if (err) {
            console.log('Error', err);
            ch.ackAll(msg);
          } else {
            console.log('Email sent: ' + info.response);
            ch.ack(msg);
          }
        }
      );
    });
  });
