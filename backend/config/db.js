
import mongoose from 'mongoose';

let lastResetTime = Date.now();
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const heartbeat = async () => {
  try {
    const db = mongoose.connection.db;
    const activityLog = db.collection('heartbeat');
    const currentTime = Date.now();

    if (currentTime - lastResetTime >= RESET_INTERVAL) {
      await activityLog.updateOne(
        { _id: 'cluster_heartbeat' },
        { $set: { count: 0, lastReset: new Date() } },
        { upsert: true }
      );
      lastResetTime = currentTime;
      console.log(`[${new Date().toISOString()}] 24-hour cycle reached. Count reset to 0.`);
    } else {
      await activityLog.updateOne(
        { _id: 'cluster_heartbeat' },
        { $inc: { count: 1 }, $set: { lastActive: new Date() } },
        { upsert: true }
      );
      console.log(`[${new Date().toISOString()}] Heartbeat sent (incremented).`);
    }
  } catch (error) {
    console.error('Heartbeat operation failed:', error);
  }
};

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Start heartbeat to keep cluster active
    await heartbeat();
    setInterval(heartbeat, 30 * 60 * 1000); // Every 30 minutes
    console.log('Heartbeat monitoring started (30-minute intervals)');
    
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;