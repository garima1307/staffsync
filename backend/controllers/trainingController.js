const Training = require('../models/Training');
const Notification = require('../models/Notification');

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Authenticated
const getTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (department && department !== 'All') {
      query.$or = [{ department: 'All' }, { department }];
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name designation')
      .populate('enrolledEmployees', 'name email department designation')
      .sort({ startDate: 1 });

    res.json({ success: true, count: trainings.length, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a training program
// @route   POST /api/trainings
// @access  HR / Manager
const createTraining = async (req, res) => {
  try {
    const { title, description, trainer, department, startDate, endDate, capacity } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      department: department || 'All',
      startDate,
      endDate,
      capacity: capacity || 30,
      createdBy: req.user._id,
      enrolledEmployees: [],
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in training
// @route   POST /api/trainings/:id/enroll
// @access  Authenticated
const enrollTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    if (training.enrolledEmployees.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this training' });
    }

    if (training.enrolledEmployees.length >= training.capacity) {
      return res.status(400).json({ success: false, message: 'Training program is full' });
    }

    training.enrolledEmployees.push(req.user._id);
    await training.save();

    await Notification.create({
      recipient: req.user._id,
      sender: training.createdBy,
      title: 'Training Enrollment Confirmed',
      message: `You have successfully enrolled in "${training.title}".`,
      type: 'training',
      link: '/trainings',
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in training',
      data: training,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update training program
// @route   PUT /api/trainings/:id
// @access  HR / Manager
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Training updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  HR / Manager
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    await training.deleteOne();
    res.json({ success: true, message: 'Training program deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTrainings,
  createTraining,
  enrollTraining,
  updateTraining,
  deleteTraining,
};
