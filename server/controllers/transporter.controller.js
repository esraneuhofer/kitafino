const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.1und1.de',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  // service: 'Gmail',
  auth: {
    user: 'noreply@cateringexpert.de',
    pass: '5/5e_FBw)JWTXpu!!adsaaa22'
  }
});

module.exports = transporter;
