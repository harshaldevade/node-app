const request = require('request')

const forecast = (latitude, longitude, callback) => {
    const url = 'https://api.darksky.net/forecast/30f3b10a8619285e54a5a8ef9c2e5926/' + latitude + ',' + longitude

    request({url: url, json: true}, (error, response) => {
        if(error){
            callback('Unable to connect forecast service!', undefined)
        } else if(response.body.error){
            callback('Unable to find location', undefined)
        }else{
            callback(undefined, response.body.daily.data[0].summary + ' It is currently ' + response.body.currently.temperature + ' degrees Fahrenheit out. There is a ' + response.body.currently.precipProbability + '% chance of rain.')
        }
    })
}

module.exports = forecast