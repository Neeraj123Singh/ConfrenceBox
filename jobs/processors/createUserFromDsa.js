var path = require('path');
const { logger } = require("../../api/helpers/logger");
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
var uuid = require('node-uuid');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = function (emailBody, isHtml) {
    let mailOptions;
    if (isHtml) {
        mailOptions = {
            from: process.env.FROM_EMAIL,
            to: emailBody.to,
            subject: emailBody.subject,
            html: emailBody.body
        };
        console.log(mailOptions)
    } else {
        mailOptions = {
            from: process.env.FROM_EMAIL,
            to: emailBody.to,
            subject: emailBody.subject,
            text: emailBody.body
        };

    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
        } else {
            logger.info('Email sent: ' + info.response);
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = async function (job) {
  try {

  } catch (e) {
    console.log(e)
  }
};

