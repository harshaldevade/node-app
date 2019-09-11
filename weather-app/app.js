const getGeocode = require("./utils/getGeocode");
const forecast = require("./utils/forecast");

const address = process.argv[2];

if (!address) {
  console.log("Please provide the location.");
} else {
  getGeocode(address, (error, data) => {
    if (error) {
      return console.log("Error: ", error);
    }
    forecast(data.latitude, data.longitude, (error, forecastData) => {
      if (error) {
        return console.log("Error: ", error);
      }
      console.log(data.location);
      console.log(forecastData);
    });
  });
}
