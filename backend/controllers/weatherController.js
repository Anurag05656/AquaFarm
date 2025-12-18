import axios from 'axios';

// Crop water requirements (mm/day) based on growth stage
const cropWaterNeeds = {
  wheat: { low: 3, medium: 5, high: 7 },
  rice: { low: 5, medium: 8, high: 12 },
  corn: { low: 4, medium: 6, high: 9 },
  cotton: { low: 4, medium: 6, high: 8 },
  sugarcane: { low: 5, medium: 7, high: 10 },
  vegetables: { low: 3, medium: 5, high: 7 },
  fruits: { low: 4, medium: 6, high: 8 },
  other: { low: 3, medium: 5, high: 7 }
};

// @desc    Get current weather
// @route   GET /api/weather/current
export const getCurrentWeather = async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const { lat, lon, city } = req.query;
    
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ message: 'Please provide location (lat/lon or city)' });
    }

    const response = await axios.get(url);
    const data = response.data;

    res.json({
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      visibility: data.visibility,
      clouds: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      coord: data.coord
    });
  } catch (error) {
    console.error(error);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
};

// @desc    Get weather forecast
// @route   GET /api/weather/forecast
export const getWeatherForecast = async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const { lat, lon, city } = req.query;
    
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ message: 'Please provide location (lat/lon or city)' });
    }

    const response = await axios.get(url);
    const data = response.data;

    // Process 5-day forecast (every 3 hours)
    const forecast = data.list.map(item => ({
      dateTime: new Date(item.dt * 1000),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      main: item.weather[0].main,
      windSpeed: item.wind.speed,
      rain: item.rain?.['3h'] || 0,
      clouds: item.clouds.all
    }));

    // Group by day
    const dailyForecast = {};
    forecast.forEach(item => {
      const dateKey = item.dateTime.toISOString().split('T')[0];
      if (!dailyForecast[dateKey]) {
        dailyForecast[dateKey] = {
          date: dateKey,
          temps: [],
          humidity: [],
          rain: 0,
          conditions: []
        };
      }
      dailyForecast[dateKey].temps.push(item.temperature);
      dailyForecast[dateKey].humidity.push(item.humidity);
      dailyForecast[dateKey].rain += item.rain;
      dailyForecast[dateKey].conditions.push(item.main);
    });

    // Calculate daily averages
    const dailySummary = Object.values(dailyForecast).map(day => ({
      date: day.date,
      avgTemp: (day.temps.reduce((a, b) => a + b, 0) / day.temps.length).toFixed(1),
      minTemp: Math.min(...day.temps).toFixed(1),
      maxTemp: Math.max(...day.temps).toFixed(1),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      totalRain: day.rain.toFixed(1),
      mainCondition: day.conditions.sort((a, b) =>
        day.conditions.filter(v => v === a).length - day.conditions.filter(v => v === b).length
      ).pop()
    }));

    res.json({
      location: data.city.name,
      country: data.city.country,
      hourly: forecast.slice(0, 24),
      daily: dailySummary
    });
  } catch (error) {
    console.error(error);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(500).json({ message: 'Error fetching forecast data', error: error.message });
  }
};

// @desc    Get irrigation recommendations
// @route   GET /api/weather/recommendations
export const getIrrigationRecommendations = async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const { lat, lon, city, cropType = 'other', fieldArea = 1, areaUnit = 'acres' } = req.query;
    
    // Get current weather
    let weatherUrl;
    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ message: 'Please provide location' });
    }

    // Get forecast
    let forecastUrl;
    if (lat && lon) {
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    } else {
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    }

    const [weatherResponse, forecastResponse] = await Promise.all([
      axios.get(weatherUrl),
      axios.get(forecastUrl)
    ]);

    const currentWeather = weatherResponse.data;
    const forecast = forecastResponse.data;

    // Calculate expected rainfall in next 24 hours
    const next24Hours = forecast.list.slice(0, 8);
    const expectedRainfall = next24Hours.reduce((total, item) => {
      return total + (item.rain?.['3h'] || 0);
    }, 0);

    // Determine irrigation need based on conditions
    const temp = currentWeather.main.temp;
    const humidity = currentWeather.main.humidity;
    const cropNeeds = cropWaterNeeds[cropType] || cropWaterNeeds.other;

    // Calculate base water need
    let waterNeedLevel = 'medium';
    if (temp > 35 || humidity < 30) {
      waterNeedLevel = 'high';
    } else if (temp < 20 || humidity > 70) {
      waterNeedLevel = 'low';
    }

    // Convert area to hectares for calculation
    let areaInHectares = parseFloat(fieldArea);
    if (areaUnit === 'acres') {
      areaInHectares *= 0.4047;
    } else if (areaUnit === 'sqft') {
      areaInHectares *= 0.0000929;
    }

    // Calculate water needed (mm/day * hectares * 10000 = liters)
    const waterPerHectare = cropNeeds[waterNeedLevel] * 10000;
    const totalWaterNeeded = waterPerHectare * areaInHectares;

    // Adjust for expected rainfall (1mm rain = 10 liters per sqm)
    const rainfallContribution = expectedRainfall * areaInHectares * 10000;
    const adjustedWaterNeeded = Math.max(0, totalWaterNeeded - rainfallContribution);

    // Generate recommendations
    const recommendations = [];
    let irrigationAdvice = '';
    let urgency = 'normal';

    // Temperature-based recommendations
    if (temp > 35) {
      recommendations.push({
        type: 'temperature',
        icon: '🌡️',
        title: 'High Temperature Alert',
        message: 'Consider irrigating during early morning (5-7 AM) or evening (6-8 PM) to reduce evaporation.',
        priority: 'high'
      });
      urgency = 'high';
    } else if (temp > 30) {
      recommendations.push({
        type: 'temperature',
        icon: '☀️',
        title: 'Warm Weather',
        message: 'Moderate temperatures. Standard irrigation schedule is recommended.',
        priority: 'medium'
      });
    } else if (temp < 10) {
      recommendations.push({
        type: 'temperature',
        icon: '❄️',
        title: 'Cold Weather',
        message: 'Reduce irrigation frequency. Plants require less water in cold conditions.',
        priority: 'low'
      });
    }

    // Rainfall-based recommendations
    if (expectedRainfall > 10) {
      recommendations.push({
        type: 'rain',
        icon: '🌧️',
        title: 'Rain Expected',
        message: `${expectedRainfall.toFixed(1)}mm of rain expected in the next 24 hours. Consider skipping irrigation.`,
        priority: 'high'
      });
      irrigationAdvice = 'Skip irrigation today - significant rainfall expected.';
      urgency = 'low';
    } else if (expectedRainfall > 5) {
      recommendations.push({
        type: 'rain',
        icon: '🌦️',
        title: 'Light Rain Expected',
        message: `${expectedRainfall.toFixed(1)}mm of rain expected. Reduce irrigation amount.`,
        priority: 'medium'
      });
      irrigationAdvice = 'Reduce irrigation by 50% - light rainfall expected.';
    } else if (expectedRainfall === 0 && humidity < 40) {
      recommendations.push({
        type: 'drought',
        icon: '🏜️',
        title: 'Dry Conditions',
        message: 'No rain expected and low humidity. Ensure adequate irrigation.',
        priority: 'high'
      });
      irrigationAdvice = 'Full irrigation recommended - dry conditions expected.';
      urgency = 'high';
    }

    // Humidity-based recommendations
    if (humidity < 30) {
      recommendations.push({
        type: 'humidity',
        icon: '💨',
        title: 'Low Humidity',
        message: 'Very dry air increases evapotranspiration. Consider increasing irrigation.',
        priority: 'high'
      });
    } else if (humidity > 80) {
      recommendations.push({
        type: 'humidity',
        icon: '💧',
        title: 'High Humidity',
        message: 'High humidity reduces water loss. You may reduce irrigation slightly.',
        priority: 'low'
      });
    }

    // Wind-based recommendations
    if (currentWeather.wind.speed > 10) {
      recommendations.push({
        type: 'wind',
        icon: '💨',
        title: 'Windy Conditions',
        message: 'High winds increase evaporation. Avoid sprinkler irrigation, prefer drip systems.',
        priority: 'medium'
      });
    }

    // Crop-specific recommendations
    const cropAdvice = {
      rice: 'Rice requires standing water. Maintain 5-10cm water depth in paddies.',
      wheat: 'Wheat is drought-tolerant. Avoid overwatering.',
      corn: 'Corn needs consistent moisture, especially during tasseling.',
      cotton: 'Cotton is sensitive to waterlogging. Ensure good drainage.',
      sugarcane: 'Sugarcane requires frequent irrigation during growth phase.',
      vegetables: 'Vegetables need consistent moisture. Mulching helps retain water.',
      fruits: 'Fruit trees benefit from deep, infrequent watering.'
    };

    if (cropAdvice[cropType]) {
      recommendations.push({
        type: 'crop',
        icon: '🌱',
        title: `${cropType.charAt(0).toUpperCase() + cropType.slice(1)} Care`,
        message: cropAdvice[cropType],
        priority: 'medium'
      });
    }

    // Default irrigation advice if not set
    if (!irrigationAdvice) {
      irrigationAdvice = `Standard irrigation of ${adjustedWaterNeeded.toFixed(0)} liters recommended for your ${fieldArea} ${areaUnit} field.`;
    }

    // Best time to irrigate
    const bestTime = temp > 30 ? 'Early morning (5-7 AM) or evening (6-8 PM)' : 'Morning (6-9 AM)';

    res.json({
      location: currentWeather.name,
      currentConditions: {
        temperature: temp,
        humidity: humidity,
        description: currentWeather.weather[0].description,
        windSpeed: currentWeather.wind.speed
      },
      forecast: {
        expectedRainfall: expectedRainfall.toFixed(1),
        next24Hours: next24Hours.map(item => ({
          time: new Date(item.dt * 1000),
          temp: item.main.temp,
          rain: item.rain?.['3h'] || 0,
          condition: item.weather[0].main
        }))
      },
      irrigation: {
        urgency,
        advice: irrigationAdvice,
        bestTime,
        waterNeeded: {
          base: totalWaterNeeded.toFixed(0),
          adjusted: adjustedWaterNeeded.toFixed(0),
          unit: 'liters'
        },
        cropWaterNeed: cropNeeds[waterNeedLevel],
        waterNeedLevel
      },
      recommendations: recommendations.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating recommendations', error: error.message });
  }
};