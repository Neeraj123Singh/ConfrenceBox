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
    let data = job.data;
    let query = ` select * from  confrence_speaker where confrence_id = ? `;
    let bindParams = [data.conference_id];
    let members = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    let userIds = [];
    for(let i=0;i<members.length;i++){
        userIds.push(members[i].user_id);
    }
    if(userIds.length==0){
        return;
    }
    query = ` select * from  users where id  in (?) `;
    bindParams = [userIds];
    let users = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    for(let i=0;i<users.length;i++){
        sendEmail({to:users[i].email,subject:`Confrence Box Promotion For Speakers`,body:data.email_template},1)
    }
  } catch (e) {
    console.log(e)
  }
};

