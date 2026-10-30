const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const assignedRole = role && ['hr', 'manager', 'employee'].includes(role) ? role : 'employee';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'General',
      designation: designation || (assignedRole === 'hr' ? 'HR Specialist' : assignedRole === 'manager' ? 'Team Lead' : 'Software Engineer'),
      phone: phone || '',
    });

    if (assignedRole === 'employee') {
      const count = await Employee.countDocuments();
      const empId = `EMP-${(count + 1).toString().padStart(4, '0')}`;
      await Employee.create({
        user: user._id,
        employeeId: empId,
        department: user.department,
        designation: user.designation,
      });
    } else if (assignedRole === 'manager') {
      await Manager.create({
        user: user._id,
        department: user.department,
        teamMembers: [],
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact HR.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let details = null;

    if (user.role === 'employee') {
      details = await Employee.findOne({ user: user._id }).populate('manager', 'name email department designation');
    } else if (user.role === 'manager') {
      details = await Manager.findOne({ user: user._id }).populate('teamMembers', 'name email department designation');
    }

    res.json({
      success: true,
      user,
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, address, emergencyContact, skills } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();

    if (user.role === 'employee') {
      const employee = await Employee.findOne({ user: user._id });
      if (employee) {
        if (address) employee.address = { ...employee.address, ...address };
        if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
        if (skills) employee.skills = skills;
        await employee.save();
      }
    }

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updatePassword,
  updateProfile,
};
