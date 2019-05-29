const nodemailer = require('nodemailer');

module.exports.sendMail = (to, subject, body,from='no-replay@milkrevolution.in') => {
    console.log("reached")

    var smtpConfig = {
        pool: true,
        host: 'mail.milkrevolution.in',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'no-replay@milkrevolution.in',
            pass: 'Johnpeter@17'
        }
    }

    let transporter = nodemailer.createTransport(smtpConfig);
  
    let mailOptions = {
      from,
      to: to,
      subject: subject,
      html: body
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}