// include dependencies
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
// Get configuration object.
//const { config } = require(process.cwd() + '/configuration/config');
//Get Logger object to log the info,warn,error etc messages.
//const FIGmdLogger = require(process.cwd() + '/utility/logger').logger;
const errorHandler = require(process.cwd() + '/utility/errorhandler');

//expose the services
require('./services')(app);

// register default middlewares 
app.use(errorHandler());

var server = http.createServer(app);
server.listen(parseInt(process.env.PORT));

//FIGmdLogger.info("app listening on port: " + config.port);
console.log("app listening on port: " + process.env.PORT);

module.exports = server;