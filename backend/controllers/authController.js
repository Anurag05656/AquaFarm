import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, farmName, location } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFarmName = farmName ? farmName.trim() : 'My Farm';

    // Check if user exists
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      farmName: sanitizedFarmName,
      location
    });

    if (user) {
      // Create welcome notifications
      await createNotification(user._id, {
        title: 'Welcome to AquaFarm! 🌱',
        message: 'Get started by adding your first field and tracking water usage.',
        type: 'system',
        priority: 'medium',
        actionUrl: '/fields'
      });

      await createNotification(user._id, {
        title: 'Weather Integration Ready 🌤️',
        message: 'Check the weather page for irrigation recommendations based on current conditions.',
        type: 'weather',
        priority: 'low',
        actionUrl: '/weather'
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        farmName: user.farmName,
        location: user.location,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Check for user
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      farmName: user.farmName,
      location: user.location,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        farmName: user.farmName,
        location: user.location
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (user) {
      // If changing password, verify current password first
      if (req.body.password) {
        // Check if user has a password (not Google OAuth user)
        if (!user.password) {
          return res.status(400).json({ message: 'Cannot set password for Google OAuth accounts' });
        }
        
        if (!req.body.currentPassword || req.body.currentPassword.trim() === '') {
          return res.status(400).json({ message: 'Current password is required to change password' });
        }
        
        const isMatch = await user.matchPassword(req.body.currentPassword);
        
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        user.password = req.body.password;
      }

      // Only update other fields if password is not being changed or if it was successfully verified
      if (!req.body.password) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.farmName = req.body.farmName || user.farmName;
        user.location = req.body.location || user.location;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        farmName: updatedUser.farmName,
        location: updatedUser.location,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};