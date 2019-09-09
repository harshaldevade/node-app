const request = require('request')

// const geocodeURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/philadelphia.json?access_token=pk.eyJ1IjoiaGFyc2hhbGRldmFkZSIsImEiOiJjazBjMXBrMnIwaHB0M2RvZDhuNzJnNGJqIn0.px-Koal2Hzz7JyPUw3tVgA&limit=1'

// request({ url: geocodeURL, json: true }, (error, response) => {
//     if (error) {
//         console.log('Unable to connect to location services!')
//     } else if (response.body.features.length === 0) {
//         console.log('Unable to find location. Try another search.')
//     } else {
//         const latitude = response.body.features[0].center[1]
//         const longitude = response.body.features[0].center[0]
//         console.log(latitude, longitude)

//         const url = 'https://api.darksky.net/forecast/30f3b10a8619285e54a5a8ef9c2e5926/37.8267,-122.4233'

//         request({ url: url, json: true }, (error, response) => {
//             if (error) {
//                 console.log('Unable to connect to weather service!')
//             } else if (response.body.error) {
//                 console.log('Unable to find location')
//             } else {
//                 console.log(response.body.daily.data[0].summary + ' It is currently ' + response.body.currently.temperature + ' degress out. There is a ' + response.body.currently.precipProbability + '% chance of rain.')
//             }
//         })
//     }
// })

const getGeocode = (address, callback) => {
    const geocodeURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + '.json?access_token=pk.eyJ1IjoiaGFyc2hhbGRldmFkZSIsImEiOiJjazBjMXBrMnIwaHB0M2RvZDhuNzJnNGJqIn0.px-Koal2Hzz7JyPUw3tVgA&limit=1'
    request({url:geocodeURL, json:true},(error,response) => {
        if(error){
            callback('Unable to connect to location services!', undefined)
        } else if(response.body.features.length === 0){
            callback('Unable to find location. Try another search.', undefined)
        } else{
            callback(undefined, {
                latitude: response.body.features[0].center[1],
                longitude: response.body.features[0].center[0],
                location: response.body.features[0].place_name
            })
        }
    })
    console.log(address)
}

getGeocode('Pune', (error, data) => {
    console.log('Error: ', error)
    console.log('Data: ', data)
})