import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  createNotification
} from '../controllers/notificationController.js';
import protect from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/', protect, async (req, res) => {
  try {
    const notification = await Notification.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;