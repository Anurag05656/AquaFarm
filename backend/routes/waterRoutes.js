import express from 'express';
import { getWaterUsage, addWaterUsage, getWaterStats, deleteWaterUsage } from '../controllers/waterController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWaterUsage)
  .post(addWaterUsage);

router.get('/stats', getWaterStats);

router.delete('/:id', deleteWaterUsage);

export default router;