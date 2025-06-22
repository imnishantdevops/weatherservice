const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.APIKEY;
const port = process.env.PORT || 3000; // Fallback to 3000 if PORT not set

// Liveness Probe - Simply returns 200 if server is up
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Readiness Probe - Optionally checks external service (OpenWeatherMap)
app.get('/readiness', async (req, res) => {
  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}`);
    if (response.status === 200) {
      res.status(200).send('Ready');
    } else {
      res.status(500).send('Not Ready');
    }
  } catch (err) {
    res.status(500).send('Not Ready');
  }
});

// Main weather route
app.get('/', (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).send('Address query parameter is required.');
  }

  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${address}&units=metric&appid=${API_KEY}`;
  const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${address}&units=metric&appid=${API_KEY}`;

  axios.get(weatherUrl)
    .then(response => {
      const currentWeatherData = response.data;
      const cityName = currentWeatherData.name;
      const currentTemperature = currentWeatherData.main.temp;

      return axios.get(forecastUrl)
        .then(forecastResponse => {
          const forecastData = forecastResponse.data;
          const forecastList = forecastData.list;

          const forecastMessages = forecastList.map(item => {
            const forecastTime = new Date(item.dt * 1000).toLocaleTimeString();
            const forecastTemperature = item.main.temp;
            return `Time: ${forecastTime}<br>Temperature: ${forecastTemperature}&deg;C`;
          });

          const message = `
            <h1>City Name: ${cityName}</h1>
            <h2>Current Weather:</h2>
            <p>Temperature: ${currentTemperature}&deg;C</p>
            <h2>Forecast for the Next Days:</h2>
            ${forecastMessages.join('<br><br>')}
          `;

          res.send(`<html><body><div id='container'>${message}</div></body></html>`);
        });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error occurred while fetching weather data');
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
