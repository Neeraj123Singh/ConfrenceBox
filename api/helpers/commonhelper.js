const { logger } = require("./logger");
const nodemailer = require('nodemailer');
let AWS = require('aws-sdk');
const validate = require('deep-email-validator')





var currentTime = new Date();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.validateEmail  = async function(email){
    let res  =  await validate.validate(email);
    return res.valid;
}

exports.sendEmail = function (emailBody, isHtml) {
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
            console.log(error)
        } else {
            logger.info('Email sent: ' + info.response);
            console.log('Email sent: ' + info.response);
        }
    });
}

exports.minuteDiffence = (date2,date1) => {
    let diffMs = (date1 - date2);
    let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); 
    return diffMins;
}

exports.uploadToS3 = async function (userId, file, t, ContentType, typ) {
    const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, region: AWS_REGION });

    const s3 = new AWS.S3();

    const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    let type;
    if (typ) {
        type = typ;
    } else {
        type = file.split(';')[0].split('/')[1];
    }
    let k;
    if (!ContentType) {
        ContentType = `image/${type}`;
    }
    // console.log(type)
    if (ContentType == 'application/octet-stream') {
        k = `${userId}/${userId}_${t}.${typ}`;
    } else {
        k = `${userId}/${userId}_${t}.${type}`
    }
    const params = {
        Bucket: S3_BUCKET,
        Key: k, // type is not required
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64', // required
        ContentType // required. Notice the back ticks
    }

    let location = '';
    let key = '';

    const { Location, Key } = await s3.upload(params).promise();
    location = Location;
    key = Key;


    return location;

}
