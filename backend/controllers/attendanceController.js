const Attendance = require('../models/Attendance');
const Manager = require('../models/Manager');
const User = require('../models/User');

// Helper to get normalized start of day
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Employee Check-in
// @route   POST /api/attendance/check-in
// @access  Employee / All
const checkIn = async (req, res) => {
  try {
    const today = getStartOfDay();
    const now = new Date();

    let record = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (record && record.checkIn) {
      return res.status(400).json({ success: false, message: 'You have already checked in today' });
    }

    // Determine status (e.g. after 9:30 AM is considered Late)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const status = isLate ? 'Late' : 'Present';

    if (!record) {
      record = await Attendance.create({
        user: req.user._id,
        date: today,
        checkIn: now,
        status,
        notes: req.body.notes || (isLate ? 'Late arrival' : 'On-time'),
      });
    } else {
      record.checkIn = now;
      record.status = status;
      if (req.body.notes) record.notes = req.body.notes;
      await record.save();
    }

    res.status(200).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Employee Check-out
// @route   POST /api/attendance/check-out
// @access  Employee / All
const checkOut = async (req, res) => {
  try {
    const today = getStartOfDay();
    const now = new Date();

    const record = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'Cannot check out without checking in first' });
    }

    if (record.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today' });
    }

    record.checkOut = now;
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.workHours = hours;

    if (hours < 4 && record.status !== 'On-Leave') {
      record.status = 'Half-day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Total hours: ${hours}`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's attendance records
// @route   GET /api/attendance/my
// @access  Employee / All
const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { user: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).sort({ date: -1 }).limit(60);

    // Today's status
    const today = getStartOfDay();
    const todayRecord = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    res.json({
      success: true,
      today: todayRecord,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records (HR / Manager)
// @route   GET /api/attendance
// @access  HR / Manager
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, employeeId } = req.query;
    let query = {};

    if (date) {
      const targetDate = getStartOfDay(date);
      query.date = {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (req.user.role === 'manager') {
      const managerRecord = await Manager.findOne({ user: req.user._id });
      const teamIds = managerRecord ? managerRecord.teamMembers : [];
      query.user = { $in: teamIds };
    } else if (employeeId) {
      query.user = employeeId;
    }

    let records = await Attendance.find(query)
      .populate('user', 'name email department designation')
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    if (department && department !== 'All') {
      records = records.filter(
        (r) => r.user && r.user.department === department
      );
    }

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual attendance mark / adjust (HR)
// @route   POST /api/attendance/manual
// @access  HR
const manualAttendance = async (req, res) => {
  try {
    const { userId, date, status, checkIn, checkOut, workHours, notes } = req.body;

    const targetDate = getStartOfDay(date);
    let record = await Attendance.findOne({
      user: userId,
      date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (record) {
      if (status) record.status = status;
      if (checkIn) record.checkIn = new Date(checkIn);
      if (checkOut) record.checkOut = new Date(checkOut);
      if (workHours !== undefined) record.workHours = workHours;
      if (notes !== undefined) record.notes = notes;
      await record.save();
    } else {
      record = await Attendance.create({
        user: userId,
        date: targetDate,
        status: status || 'Present',
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        workHours: workHours || 8,
        notes: notes || 'Manually recorded by HR',
      });
    }

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  manualAttendance,
};
