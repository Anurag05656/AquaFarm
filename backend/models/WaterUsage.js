import mongoose from 'mongoose';

const waterUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  waterUsed: {
    type: Number,
    required: [true, 'Please add water usage'],
    min: 0
  },
  unit: {
    type: String,
    default: 'liters',
    enum: ['liters', 'gallons', 'cubic_meters']
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  method: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'furrow', 'manual'],
    default: 'drip'
  },
  notes: {
    type: String,
    default: ''
  },
  weatherCondition: {
    type: String,
    default: ''
  },
  temperature: {
    type: Number,
    default: null
  },
  humidity: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
waterUsageSchema.index({ user: 1, date: -1 });
waterUsageSchema.index({ field: 1, date: -1 });

export default mongoose.model('WaterUsage', waterUsageSchema);