const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port:Number( process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

function sendMail(to, subject, text) {
  return transporter.sendMail({
    from: '"Todo App" <no-reply@todoapp.com>',
    to,
    subject,
    text
  });
}
  
module.exports = sendMail; 