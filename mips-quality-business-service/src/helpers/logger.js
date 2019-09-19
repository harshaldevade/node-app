const fetch = require('node-fetch');
const json = require('circular-json');
require("dotenv").config();
var headers = {
    "Content-Type": "application/json",
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8'
};
const model = {              
    application: {
        registry: process.env.UNIT.toLowerCase(),
        name: process.env.APPLICATION,
        env: process.env.ENVIRONMENT,
    },
    content: {} ,
    message: ""
}

const itworks = async () => {
    try {
        var url = `${process.env.LOGGER_ENDPOINT}`;
        let response = await fetch(url, {
            method: 'get',
            headers: headers,
            timeout: 0,
            gzip: true
        });
        return await response.json();
    }
    catch (error) {
        console.log(error);
    }
}

const setLevel = async (level) => {
    try {
        var status = await itworks();        
        if (status) {
            var url = `${process.env.LOGGER_ENDPOINT}set/${level}`;            
            let response = await fetch(url, {
                method: 'get',                
                headers: headers,
                timeout: 0,
                gzip: true
            });            
            return await response.json();
        }
    }
    catch (error) {
        console.log(error);
    }
};

const log = async (level, message, logBody) => {
    try {
        var status = await itworks();        
        if (status) {
            var url = `${process.env.LOGGER_ENDPOINT}${level}`;
            var body = {
                message: message,
                log: logBody
            }
            let response = await fetch(url, {
                method: 'post',
                body: json.stringify(body),
                headers: headers,
                timeout: 0,
                gzip: true
            });
            return await response.json();
        }
    }
    catch (error) {
        console.log(error);
    }
};
const logger = { log, setLevel, model };
module.exports = logger;