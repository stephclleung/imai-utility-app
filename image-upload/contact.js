const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.IMAI_SOS_KEY);
const mail = {
    to: process.env.DEVELOPER_EMAILS,
    from: 'no-reply@imai-utils-app.herokuapp.com',
    subject: 'SOS From Imai Poker Utils',
    html: '<strong>There is an issue with one of the access tokens. Check the application asap.</strong>'
}


const sendMail = (error, mailContent = mail) => {
    if (error) {
        mailContent.html += error;
    }
    sgMail.send(mail);
}

module.exports = sendMail;