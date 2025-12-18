import WaterUsage from '../models/WaterUsage.js';
import Field from '../models/Field.js';

// @desc    Get water usage records
// @route   GET /api/water
export const getWaterUsage = async (req, res) => {
  try {
    const { startDate, endDate, fieldId } = req.query;
    
    let query = { user: req.user._id };
    
    if (fieldId) {
      query.field = fieldId;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const waterUsage = await WaterUsage.find(query)
      .populate('field', 'name cropType')
      .sort({ date: -1 });

    res.json(waterUsage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add water usage record
// @route   POST /api/water
export const addWaterUsage = async (req, res) => {
  try {
    const { field, date, waterUsed, unit, duration, method, notes, weatherCondition, temperature, humidity } = req.body;

    // Verify field belongs to user
    const fieldExists = await Field.findOne({ _id: field, user: req.user._id });
    if (!fieldExists) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const waterUsage = await WaterUsage.create({
      user: req.user._id,
      field,
      date: date || new Date(),
      waterUsed,
      unit,
      duration,
      method,
      notes,
      weatherCondition,
      temperature,
      humidity
    });

    const populatedUsage = await WaterUsage.findById(waterUsage._id).populate('field', 'name cropType');
    res.status(201).json(populatedUsage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get water usage statistics
// @route   GET /api/water/stats
export const getWaterStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Total water used in period
    const totalUsage = await WaterUsage.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWater: { $sum: '$waterUsed' },
          avgDaily: { $avg: '$waterUsed' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Usage by field
    const usageByField = await WaterUsage.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$field',
          totalWater: { $sum: '$waterUsed' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'fields',
          localField: '_id',
          foreignField: '_id',
          as: 'fieldInfo'
        }
      },
      {
        $unwind: '$fieldInfo'
      },
      {
        $project: {
          fieldName: '$fieldInfo.name',
          cropType: '$fieldInfo.cropType',
          totalWater: 1,
          count: 1
        }
      }
    ]);

    // Daily usage for chart
    const dailyUsage = await WaterUsage.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalWater: { $sum: '$waterUsed' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Usage by irrigation method
    const usageByMethod = await WaterUsage.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$method',
          totalWater: { $sum: '$waterUsed' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: totalUsage[0] || { totalWater: 0, avgDaily: 0, count: 0 },
      byField: usageByField,
      daily: dailyUsage,
      byMethod: usageByMethod
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete water usage record
// @route   DELETE /api/water/:id
export const deleteWaterUsage = async (req, res) => {
  try {
    const waterUsage = await WaterUsage.findOne({ _id: req.params.id, user: req.user._id });

    if (!waterUsage) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await WaterUsage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};