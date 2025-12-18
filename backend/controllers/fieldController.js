import Field from '../models/Field.js';

// @desc    Get all fields for user
// @route   GET /api/fields
export const getFields = async (req, res) => {
  try {
    const fields = await Field.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create field
// @route   POST /api/fields
export const createField = async (req, res) => {
  try {
    const { name, cropType, area, areaUnit, soilType, irrigationType } = req.body;

    const field = await Field.create({
      user: req.user._id,
      name,
      cropType,
      area,
      areaUnit,
      soilType,
      irrigationType
    });

    res.status(201).json(field);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update field
// @route   PUT /api/fields/:id
export const updateField = async (req, res) => {
  try {
    const field = await Field.findOne({ _id: req.params.id, user: req.user._id });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedField);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete field
// @route   DELETE /api/fields/:id
export const deleteField = async (req, res) => {
  try {
    const field = await Field.findOne({ _id: req.params.id, user: req.user._id });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    await Field.findByIdAndDelete(req.params.id);
    res.json({ message: 'Field removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};