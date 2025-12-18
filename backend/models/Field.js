import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a field name'],
    trim: true
  },
  cropType: {
    type: String,
    required: [true, 'Please add a crop type'],
    enum: ['wheat', 'rice', 'corn', 'cotton', 'sugarcane', 'vegetables', 'fruits', 'other']
  },
  area: {
    type: Number,
    required: [true, 'Please add field area'],
    min: 0
  },
  areaUnit: {
    type: String,
    default: 'acres',
    enum: ['acres', 'hectares', 'sqft']
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silt', 'peat', 'chalky'],
    default: 'loamy'
  },
  irrigationType: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'furrow', 'center_pivot'],
    default: 'drip'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Field', fieldSchema);