const express = require("express");
const axios = require("axios");
const brain = require("brain.js");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");


// OpenWeatherMap API-nyckel hämta här: https://home.openweathermap.org/api_keys
const WEATHER_API_KEY = "";

// Simulerad energiförbrukningsdata
const energyUsageData = [
    { hour: 0, usage: 1.2 },
    { hour: 1, usage: 1.0 },
    { hour: 2, usage: 0.9 },
    { hour: 3, usage: 0.8 },
    { hour: 4, usage: 0.8 },
    { hour: 5, usage: 1.0 },
    { hour: 6, usage: 2.5 },
    { hour: 7, usage: 3.0 },
    { hour: 8, usage: 3.2 },
    { hour: 9, usage: 3.5 },
    { hour: 10, usage: 3.8 },
    { hour: 11, usage: 4.0 },
    { hour: 12, usage: 3.9 },
    { hour: 13, usage: 3.7 },
    { hour: 14, usage: 3.5 },
    { hour: 15, usage: 3.6 },
    { hour: 16, usage: 3.8 },
    { hour: 17, usage: 4.0 },
    { hour: 18, usage: 4.2 },
    { hour: 19, usage: 4.0 },
    { hour: 20, usage: 3.9 },
    { hour: 21, usage: 3.8 },
    { hour: 22, usage: 2.5 },
    { hour: 23, usage: 0.8 }
  ];
  

// Skapa en neural nätverksmodell med Brain.js
const net = new brain.NeuralNetwork();

// Träna modellen med energidata
const trainModel = () => {
  const trainingData = energyUsageData.map((data) => ({
    input: { hour: data.hour / 24 }, // Normalisera timmar
    output: { usage: data.usage / 10 }, // Normalisera användning
  }));

  net.train(trainingData, {
    iterations: 2000,
    log: true,
    logPeriod: 100,
    learningRate: 0.01,
  });

  console.log("Model trained!");
};

// Prediktera energiförbrukning
const predictEnergyUsage = (hour) => {
  const result = net.run({ hour: hour / 24 }); // Normalisera timmen
  return result.usage * 10; // Återställ till ursprunglig skala
};

// Funktion för att hämta väderdata
const getWeatherData = async (location) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

app.get("/", (req, res) => {
    res.render("index");
  });

// API för att prediktera energiförbrukning
app.get("/predictEnergy", (req, res) => {
  const { hour } = req.query;

  if (!hour) {
    return res.status(400).send("Hour parameter is required.");
  }

  // ge felmeddelande om timmen inte är ett heltal och inte mellan 0 och 23
  if (
    !Number.isInteger(parseInt(hour)) ||
    parseInt(hour) < 0 ||
    parseInt(hour) > 23
  ) {
    return res
      .status(400)
      .send("Hour parameter must be an integer between 0 and 23.");
  }

  const prediction = predictEnergyUsage(parseInt(hour));
  res.json({ hour, predictedUsage: prediction.toFixed(2) });
});

// API för att optimera energiförbrukning baserat på väder
app.get("/optimizedEnergy", async (req, res) => {
    const { location } = req.query;
  
    if (!location) {
      return res.status(400).send("Location parameter is required.");
    }
  
    const weatherData = await getWeatherData(location);
    if (!weatherData) {
      return res.status(500).send("Error fetching weather data.");
    }
  
    const currentTemp = weatherData.main.temp;
    const condition = weatherData.weather[0].main;
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
  
    // Expanded adjustment logic
    let adjustmentFactor = 1.0;
  
    if (currentTemp > 30) {
      adjustmentFactor = 0.7; // Reduce energy usage in high temperatures
    } else if (currentTemp < 10) {
      adjustmentFactor = 1.3; // Increase for heating
    }
  
    if (windSpeed > 15) {
      adjustmentFactor *= 1.1; // Account for cooling effects of wind
    }
  
    if (humidity > 70) {
      adjustmentFactor *= 1.2; // Increase for dehumidifiers or AC
    }
  
    switch (condition) {
      case "Clear":
        adjustmentFactor *= 1.0; // No change
        break;
      case "Clouds":
        adjustmentFactor *= 1.1; // Slight increase for lighting
        break;
      case "Rain":
      case "Snow":
        adjustmentFactor *= 1.2; // Higher heating or dryer use
        break;
      default:
        adjustmentFactor *= 1.0; // Default for unknown conditions
    }
  
    const optimizedUsage = energyUsageData.map((data) => ({
      hour: data.hour,
      usage: (data.usage * adjustmentFactor).toFixed(2),
    }));
  
    res.json({
      weather: condition,
      currentTemp,
      windSpeed,
      humidity,
      optimizedUsage
    });
  });
  

// Starta servern
const port = 3000;
app.listen(port, () => {
  trainModel(); // Träna modellen vid uppstart
  console.log(`Server is running on http://localhost:${port}`);
});
