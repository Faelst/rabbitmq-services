const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '26746fe9035819',
    pass: '64ab7a7587002a',
  },
});

module.exports = { transporter };
