import express from 'express';
import { getCurrentWeather, getWeatherForecast, getIrrigationRecommendations } from '../controllers/weatherController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
router.get('/recommendations', getIrrigationRecommendations);

export default router;