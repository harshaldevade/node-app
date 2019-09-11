const express = require("express");

const app = express();

app.get("", (req, res) => {
  res.send("Home Page");
});

app.get("/help", (req, res) => {
  res.send("Help Page");
});

app.get("/forecast", (req, res) => {
  res.send("Forecast page");
});

app.listen(3000, () => {
  console.log("Service is running on port 3000");
});
