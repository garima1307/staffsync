const Leave = require('../models/Leave');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');
const Employee = require('../models/Employee');

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Employee / All
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays: diffDays,
      reason,
    });

    // Notify manager if assigned
    const employee = await Employee.findOne({ user: req.user._id });
    if (employee && employee.manager) {
      await Notification.create({
        recipient: employee.manager,
        sender: req.user._id,
        title: 'New Leave Request',
        message: `${req.user.name} applied for ${diffDays} day(s) of ${leaveType} leave.`,
        type: 'leave',
        link: '/leaves',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my
// @access  Employee / All
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaves for HR / Manager review
// @route   GET /api/leaves
// @access  HR / Manager
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    if (req.user.role === 'manager') {
      const managerRecord = await Manager.findOne({ user: req.user._id });
      const teamIds = managerRecord ? managerRecord.teamMembers : [];
      query.user = { $in: teamIds };
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email department designation')
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Reject leave request
// @route   PUT /api/leaves/:id
// @access  HR / Manager
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await Leave.findById(req.params.id).populate('user', 'name');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.reviewRemarks = reviewRemarks || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // Create notification for employee
    await Notification.create({
      recipient: leave.user._id,
      sender: req.user._id,
      title: `Leave Request ${status}`,
      message: `Your leave request for ${leave.leaveType} (${leave.totalDays} day(s)) has been ${status.toLowerCase()} by ${req.user.name}.`,
      type: 'leave',
      link: '/leaves',
    });

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel leave request (Employee)
// @route   DELETE /api/leaves/:id
// @access  Employee / Self
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this leave' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending leave requests' });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({ success: true, message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
};
