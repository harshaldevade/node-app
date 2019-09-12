const express = require("express");
const path = require("path");

const app = express();
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
  res.send("Home Page");
});

app.get("/help", (req, res) => {
  res.send("Help Page");
});

app.get("/forecast", (req, res) => {
  res.send("Forecast Page");
});

app.listen(3000, () => {
  console.log("Service is running on port 3000");
});
