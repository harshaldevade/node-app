const getGeocode = require('./utils/getGeocode')
const forecast = require('./utils/forecast')

getGeocode('Pune', (error, data) => {
    if(error){
        console.log('Error: ', error)
    } else{
        forecast(data.latitude, data.longitude, (error, data) => {
            if(error){
                console.log('Error: ', error)
            } else{
                console.log('Data: ', data)
            }
        })   
    }
})