const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide training title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide training description'],
    },
    trainer: {
      type: String,
      required: [true, 'Please specify trainer name'],
    },
    department: {
      type: String,
      default: 'All',
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify end date'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed'],
      default: 'Upcoming',
    },
    capacity: {
      type: Number,
      default: 30,
    },
    enrolledEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
