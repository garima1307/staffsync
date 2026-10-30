const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Manager = require('../models/Manager');

// @desc    Get all employees with filters
// @route   GET /api/employees
// @access  HR / Manager
const getEmployees = async (req, res) => {
  try {
    const { department, search, status, page = 1, limit = 50 } = req.query;
    let userQuery = { role: 'employee' };

    if (req.user.role === 'manager') {
      const managerRecord = await Manager.findOne({ user: req.user._id });
      const teamIds = managerRecord ? managerRecord.teamMembers : [];
      userQuery._id = { $in: teamIds };
    }

    if (department && department !== 'All') {
      userQuery.department = department;
    }

    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(userQuery)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const userIds = users.map((u) => u._id);
    let empQuery = { user: { $in: userIds } };
    if (status && status !== 'All') {
      empQuery.status = status;
    }

    const employeeRecords = await Employee.find(empQuery)
      .populate('user', 'name email department designation phone avatar isActive')
      .populate('manager', 'name email department designation');

    const total = await User.countDocuments(userQuery);

    res.json({
      success: true,
      count: employeeRecords.length,
      total,
      data: employeeRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  HR / Manager / Self
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email department designation phone avatar isActive')
      .populate('manager', 'name email department designation');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Role verification
    if (req.user.role === 'employee' && employee.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an employee (HR)
// @route   POST /api/employees
// @access  HR
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password = 'Password123!',
      department,
      designation,
      phone,
      salary,
      employmentType,
      managerId,
      joiningDate,
      address,
      emergencyContact,
      skills,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      department: department || 'Engineering',
      designation: designation || 'Software Engineer',
      phone: phone || '',
    });

    const count = await Employee.countDocuments();
    const employeeId = `EMP-${(count + 1).toString().padStart(4, '0')}`;

    const employee = await Employee.create({
      user: user._id,
      employeeId,
      department: user.department,
      designation: user.designation,
      salary: salary || 50000,
      employmentType: employmentType || 'Full-Time',
      manager: managerId || null,
      joiningDate: joiningDate || Date.now(),
      address: address || {},
      emergencyContact: emergencyContact || {},
      skills: skills || [],
    });

    // If manager specified, add employee to manager's team
    if (managerId) {
      await Manager.findOneAndUpdate(
        { user: managerId },
        { $addToSet: { teamMembers: user._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  HR / Self
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const isSelf = employee.user.toString() === req.user._id.toString();
    const isHR = req.user.role === 'hr';

    if (!isSelf && !isHR) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this employee' });
    }

    const {
      name,
      department,
      designation,
      phone,
      salary,
      status,
      employmentType,
      managerId,
      address,
      emergencyContact,
      skills,
    } = req.body;

    // Update User model fields
    const user = await User.findById(employee.user);
    if (user) {
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (isHR && department) user.department = department;
      if (isHR && designation) user.designation = designation;
      await user.save();
    }

    // Update Employee model fields
    if (address) employee.address = { ...employee.address, ...address };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (skills) employee.skills = skills;

    if (isHR) {
      if (department) employee.department = department;
      if (designation) employee.designation = designation;
      if (salary !== undefined) employee.salary = salary;
      if (status) employee.status = status;
      if (employmentType) employee.employmentType = employmentType;

      if (managerId !== undefined && managerId !== (employee.manager ? employee.manager.toString() : null)) {
        if (employee.manager) {
          await Manager.findOneAndUpdate(
            { user: employee.manager },
            { $pull: { teamMembers: employee.user } }
          );
        }
        if (managerId) {
          await Manager.findOneAndUpdate(
            { user: managerId },
            { $addToSet: { teamMembers: employee.user } }
          );
        }
        employee.manager = managerId || null;
      }
    }

    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete / deactivate employee
// @route   DELETE /api/employees/:id
// @access  HR
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Deactivate user
    await User.findByIdAndUpdate(employee.user, { isActive: false });
    employee.status = 'Terminated';
    await employee.save();

    // Remove from manager team if any
    if (employee.manager) {
      await Manager.findOneAndUpdate(
        { user: employee.manager },
        { $pull: { teamMembers: employee.user } }
      );
    }

    res.json({ success: true, message: 'Employee successfully deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get HRM dashboard summary metrics
// @route   GET /api/employees/stats/summary
// @access  HR / Manager
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    const totalManagers = await User.countDocuments({ role: 'manager', isActive: true });
    const totalHR = await User.countDocuments({ role: 'hr', isActive: true });

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    });

    const presentCount = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // Department breakdown
    const departmentDistribution = await User.aggregate([
      { $match: { role: 'employee', isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalManagers,
        totalHR,
        presentToday: presentCount,
        pendingLeaves,
        departmentDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
};
