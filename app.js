require('dotenv').config({ path: '.env' });
var express = require('express')
const fs = require('fs')
const path = require('path')
global.appRoot = path.resolve(__dirname)
var bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const basicAuth = require('express-basic-auth');
var _ = require('lodash');
const customCss = fs.readFileSync((process.cwd()+"/swagger.css"), 'utf8');

global._pathconst = require('./api/helpers/constantdata/pathconst.js')


var app = express()

global._ = _ ;

app.use('/v1/api-docs', swaggerUi.serve, basicAuth({
  users: {'Admin': 'Welcome07!'},
  challenge: true,
}),swaggerUi.setup(swaggerDocument, {customCss}));


/**
 * Express MiddleWare
 */         //handle multipart requests
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); //handle queryStrings
// app.use(bodyParser.json())        //handle json data
app.use(bodyParser.json({ limit: '50mb' }))



app.use(function (req, res, next) {
  // Mentioning content types
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Accept,Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions) 
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/v1', require(_pathconst.FilesPath.V1Routes));
app.use((err, req, res, next) => {
  if (err.error.isJoi) {
    let errDetail = []
    // we had a joi error, let's return a custom 400 json response
    if (err.error.details) {
      err.error.details.map(function (item) {
        var temp = {}
        temp[item.context.key] = item.message
        errDetail.push(temp)
      })
    }

    //return api response for joi error

  } else {
    //return other errors
  }
});

module.exports = app