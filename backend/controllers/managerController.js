const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all managers
// @route   GET /api/managers
// @access  HR
const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find()
      .populate('user', 'name email department designation phone avatar')
      .populate('teamMembers', 'name email department designation');

    res.json({ success: true, count: managers.length, data: managers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team members of logged-in manager
// @route   GET /api/managers/team
// @access  Manager
const getMyTeam = async (req, res) => {
  try {
    const manager = await Manager.findOne({ user: req.user._id })
      .populate('teamMembers', 'name email department designation phone avatar');

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found' });
    }

    const memberIds = manager.teamMembers.map((m) => m._id);
    const employeeDetails = await Employee.find({ user: { $in: memberIds } })
      .populate('user', 'name email department designation phone avatar');

    res.json({
      success: true,
      data: {
        department: manager.department,
        teamCount: employeeDetails.length,
        members: employeeDetails,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign employee to a manager
// @route   PUT /api/managers/assign
// @access  HR
const assignTeamMember = async (req, res) => {
  try {
    const { managerUserId, employeeUserId } = req.body;

    const manager = await Manager.findOne({ user: managerUserId });
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    // Update Employee record
    const employee = await Employee.findOneAndUpdate(
      { user: employeeUserId },
      { manager: managerUserId },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Add to manager's team
    await Manager.findOneAndUpdate(
      { user: managerUserId },
      { $addToSet: { teamMembers: employeeUserId } }
    );

    res.json({
      success: true,
      message: 'Employee assigned to manager successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getManagers,
  getMyTeam,
  assignTeamMember,
};
