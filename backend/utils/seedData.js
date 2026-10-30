const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/staffsync';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Employee.deleteMany();
    await Manager.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Announcement.deleteMany();
    await Training.deleteMany();
    await Notification.deleteMany();

    console.log('Existing collections cleared.');

    // 1. Create Users
    const hrUser = await User.create({
      name: 'Eleanor Vance (HR Director)',
      email: 'hr@staffsync.com',
      password: 'admin123',
      role: 'hr',
      department: 'Human Resources',
      designation: 'HR Director',
      phone: '+1 (555) 019-2834',
    });

    const managerUser = await User.create({
      name: 'Marcus Chen (Engineering Lead)',
      email: 'manager@staffsync.com',
      password: 'manager123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Lead',
      phone: '+1 (555) 018-9942',
    });

    const empUser1 = await User.create({
      name: 'Alex Rivera (Frontend Developer)',
      email: 'employee@staffsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      phone: '+1 (555) 012-3456',
    });

    const empUser2 = await User.create({
      name: 'Sarah Jenkins (Backend Developer)',
      email: 'sarah@staffsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Full Stack Engineer',
      phone: '+1 (555) 013-8765',
    });

    // 2. Create Manager Record
    await Manager.create({
      user: managerUser._id,
      department: 'Engineering',
      teamMembers: [empUser1._id, empUser2._id],
    });

    // 3. Create Employee Records
    await Employee.create({
      user: empUser1._id,
      employeeId: 'EMP-1001',
      department: 'Engineering',
      designation: 'Senior Frontend Engineer',
      manager: managerUser._id,
      joiningDate: new Date('2023-03-15'),
      salary: 95000,
      employmentType: 'Full-Time',
      status: 'Active',
      address: {
        street: '742 Evergreen Terrace',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Maria Rivera',
        relationship: 'Spouse',
        phone: '+1 (555) 098-7654',
      },
      skills: ['React', 'TypeScript', 'Redux', 'Node.js', 'Tailwind CSS'],
    });

    await Employee.create({
      user: empUser2._id,
      employeeId: 'EMP-1002',
      department: 'Engineering',
      designation: 'Full Stack Engineer',
      manager: managerUser._id,
      joiningDate: new Date('2023-08-01'),
      salary: 88000,
      employmentType: 'Full-Time',
      status: 'Active',
      address: {
        street: '120 Market Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      emergencyContact: {
        name: 'David Jenkins',
        relationship: 'Brother',
        phone: '+1 (555) 045-6789',
      },
      skills: ['Node.js', 'Express', 'MongoDB', 'React', 'Docker'],
    });

    // 4. Create Attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInTime = new Date(today);
    checkInTime.setHours(9, 10, 0);

    await Attendance.create({
      user: empUser1._id,
      date: today,
      checkIn: checkInTime,
      status: 'Present',
      notes: 'Morning sprint standup attended',
    });

    // 5. Create Leaves
    const leaveStart = new Date();
    leaveStart.setDate(leaveStart.getDate() + 7);
    const leaveEnd = new Date(leaveStart);
    leaveEnd.setDate(leaveEnd.getDate() + 2);

    await Leave.create({
      user: empUser1._id,
      leaveType: 'Annual',
      startDate: leaveStart,
      endDate: leaveEnd,
      totalDays: 3,
      reason: 'Family vacation and personal travel',
      status: 'Pending',
    });

    await Leave.create({
      user: empUser2._id,
      leaveType: 'Sick',
      startDate: new Date('2026-10-10'),
      endDate: new Date('2026-10-11'),
      totalDays: 2,
      reason: 'Doctor recommended rest for acute flu',
      status: 'Approved',
      reviewedBy: managerUser._id,
      reviewRemarks: 'Get well soon!',
      reviewedAt: new Date('2026-10-09'),
    });

    // 6. Create Announcements
    await Announcement.create({
      title: 'Annual Company Tech Summit 2026',
      content: 'We are thrilled to announce our 2026 Annual Technology Summit happening next month! Join us for keynotes, workshops, and innovation showcases.',
      category: 'Event',
      priority: 'High',
      postedBy: hrUser._id,
      targetDepartment: 'All',
    });

    await Announcement.create({
      title: 'Updated Health & Wellness Policy',
      content: 'HR has published the revised annual health benefits & mental wellness reimbursement guidelines. Check the portal for details.',
      category: 'Policy',
      priority: 'Medium',
      postedBy: hrUser._id,
      targetDepartment: 'All',
    });

    // 7. Create Training Programs
    const trainingStart = new Date();
    trainingStart.setDate(trainingStart.getDate() + 14);
    const trainingEnd = new Date(trainingStart);
    trainingEnd.setDate(trainingEnd.getDate() + 5);

    await Training.create({
      title: 'Advanced Cloud Architecture with Microservices',
      description: 'Hands-on bootcamp on microservices patterns, Kubernetes orchestration, and event-driven architectures.',
      trainer: 'Dr. Evelyn Reed (Principal Cloud Architect)',
      department: 'Engineering',
      startDate: trainingStart,
      endDate: trainingEnd,
      status: 'Upcoming',
      capacity: 25,
      enrolledEmployees: [empUser1._id],
      createdBy: managerUser._id,
    });

    // 8. Create Notifications
    await Notification.create({
      recipient: empUser1._id,
      sender: hrUser._id,
      title: 'Welcome to StaffSync!',
      message: 'Explore your employee portal to track attendance, submit leave applications, and view company updates.',
      type: 'system',
      link: '/dashboard',
    });

    console.log('==============================================');
    console.log(' StaffSync Seed Data Loaded Successfully!     ');
    console.log('==============================================');
    console.log('Demo Credentials:');
    console.log('HR:       hr@staffsync.com       / admin123');
    console.log('Manager:  manager@staffsync.com  / manager123');
    console.log('Employee: employee@staffsync.com / employee123');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
