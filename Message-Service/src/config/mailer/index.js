const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'd76e33db1a949a',
    pass: '2745450836bc2a',
  },
});

module.exports = { transporter };
