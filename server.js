require("dotenv").config();
const express = require("express"); 
const ejs = require("ejs");
const bodyParser = require("body-parser");
const https = require("https");
const _ = require("lodash");

const app = express(); 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
  }));
  
const port = process.env.PORT || 3000;
const year = new Date().getFullYear();

app.get("/", (req, res) => {
    res.render("index", {
      year: year,
      placeholder: "Type city name"
    });
})

app.post("/", (req, res) => {
  const { city } = req.body;

  // Create address using api endpoint, city name inputted by user and api key stored as an environment variable
  const apiAddress =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric" +
    "&appid=" +
    process.env.API_KEY;

  // Call the api
  https.get(apiAddress, (response) => {
      const {statusCode} = response;

      // Ternary operator to render error page if the http status code is in the 400s, otherwise render the results page
      statusCode > 399 && statusCode < 500 ? 

      res.render("error", {
        year: year, 
        placeholder: "Type city name"
      }) : 
      
      // Store the weather data when it is received and pass it over to the results page 
      // Input placeholder="Search another city" only after successful search 
      response.on("data", (data) => {
        const weatherData = JSON.parse(data);
        const weatherDescription = weatherData.weather[0].description;
        const weatherCode = weatherData.weather[0].id;
        const temperature = weatherData.main.temp;

        res.render("results", {
            year: year,
            placeholder: "Search another city", 
            // Lodash function to ensure that the city is rendered with first letter capitalized 
            city: _.startCase(city), 
            weatherDescription: weatherDescription, 
            weatherCode: weatherCode, 
            temperature: temperature
        });
      });
  });
});

app.listen(port, () => {
    console.log("Server started on port 3000");
})