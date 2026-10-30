import { initialMockState } from './mockData';

const STORAGE_KEY = 'staffsync_demo_db';

const getDB = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockState));
    return initialMockState;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockState));
    return initialMockState;
  }
};

const saveDB = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const handleMockRequest = async (config) => {
  const db = getDB();
  const url = config.url.replace(/^\/?api\/?/, '/');
  const method = (config.method || 'get').toLowerCase();
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
  const params = config.params || {};
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Simulated latency for smooth UX
  await new Promise((r) => setTimeout(r, 120));

  // --- AUTH ---
  if (url === '/auth/login' && method === 'post') {
    const user = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user || user.password !== data.password) {
      const err = new Error('Invalid credentials');
      err.response = { status: 401, data: { success: false, message: 'Invalid credentials' } };
      throw err;
    }
    const token = 'demo_jwt_token_' + user._id;
    return { data: { success: true, token, user } };
  }

  if (url === '/auth/register' && method === 'post') {
    const exists = db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      const err = new Error('User already exists');
      err.response = { status: 400, data: { success: false, message: 'User already exists' } };
      throw err;
    }
    const newUser = {
      _id: 'u-' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'employee',
      department: data.department || 'Engineering',
      designation: data.designation || 'Software Engineer',
      phone: data.phone || '',
      avatar: '',
      isActive: true,
    };
    db.users.push(newUser);
    if (newUser.role === 'employee') {
      db.employees.push({
        _id: 'emp-' + Date.now(),
        user: newUser,
        employeeId: 'EMP-' + (db.employees.length + 1001),
        department: newUser.department,
        designation: newUser.designation,
        joiningDate: new Date().toISOString(),
        salary: 55000,
        employmentType: 'Full-Time',
        status: 'Active',
        skills: ['JavaScript'],
      });
    }
    saveDB(db);
    return { data: { success: true, token: 'demo_jwt_' + newUser._id, user: newUser } };
  }

  if (url === '/auth/me' && method === 'get') {
    const user = db.users.find((u) => u._id === currentUser?._id) || db.users[0];
    const details = db.employees.find((e) => (e.user?._id || e.user) === user._id) || null;
    return { data: { success: true, user, details } };
  }

  if (url === '/auth/update-password' && method === 'put') {
    return { data: { success: true, message: 'Password updated successfully' } };
  }

  if (url === '/auth/profile' && method === 'put') {
    if (currentUser) {
      const u = db.users.find((x) => x._id === currentUser._id);
      if (u) {
        if (data.name) u.name = data.name;
        if (data.phone) u.phone = data.phone;
      }
      const emp = db.employees.find((e) => (e.user?._id || e.user) === currentUser._id);
      if (emp) {
        if (data.address) emp.address = { ...emp.address, ...data.address };
        if (data.emergencyContact) emp.emergencyContact = { ...emp.emergencyContact, ...data.emergencyContact };
        if (data.skills) emp.skills = data.skills;
      }
      saveDB(db);
    }
    return { data: { success: true, message: 'Profile updated' } };
  }

  // --- EMPLOYEES ---
  if (url === '/employees/stats/summary' && method === 'get') {
    return {
      data: {
        success: true,
        data: {
          totalEmployees: db.employees.length,
          totalManagers: db.users.filter((u) => u.role === 'manager').length,
          totalHR: db.users.filter((u) => u.role === 'hr').length,
          presentToday: db.attendance.length,
          pendingLeaves: db.leaves.filter((l) => l.status === 'Pending').length,
          departmentDistribution: [
            { _id: 'Engineering', count: 2 },
            { _id: 'Human Resources', count: 1 },
          ],
        },
      },
    };
  }

  if (url === '/employees' && method === 'get') {
    let list = [...db.employees];
    if (params.department && params.department !== 'All') {
      list = list.filter((e) => e.department === params.department);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.user?.name?.toLowerCase().includes(q) ||
          e.user?.email?.toLowerCase().includes(q) ||
          e.designation?.toLowerCase().includes(q)
      );
    }
    return { data: { success: true, count: list.length, data: list } };
  }

  if (url === '/employees' && method === 'post') {
    const newUser = {
      _id: 'u-' + Date.now(),
      name: data.name,
      email: data.email,
      password: 'Password123!',
      role: 'employee',
      department: data.department || 'Engineering',
      designation: data.designation || 'Software Engineer',
      phone: data.phone || '',
      isActive: true,
    };
    db.users.push(newUser);
    const newEmp = {
      _id: 'emp-' + Date.now(),
      user: newUser,
      employeeId: 'EMP-' + (db.employees.length + 1001),
      department: newUser.department,
      designation: newUser.designation,
      salary: Number(data.salary) || 60000,
      employmentType: data.employmentType || 'Full-Time',
      status: 'Active',
      joiningDate: new Date().toISOString(),
    };
    db.employees.push(newEmp);
    saveDB(db);
    return { data: { success: true, message: 'Employee created', data: newEmp } };
  }

  if (url.startsWith('/employees/') && method === 'put') {
    const id = url.split('/')[2];
    const emp = db.employees.find((e) => e._id === id);
    if (emp) {
      if (data.name && emp.user) emp.user.name = data.name;
      if (data.department) emp.department = data.department;
      if (data.designation) emp.designation = data.designation;
      if (data.salary) emp.salary = Number(data.salary);
      if (data.status) emp.status = data.status;
      saveDB(db);
    }
    return { data: { success: true, message: 'Updated', data: emp } };
  }

  if (url.startsWith('/employees/') && method === 'delete') {
    const id = url.split('/')[2];
    db.employees = db.employees.filter((e) => e._id !== id);
    saveDB(db);
    return { data: { success: true, message: 'Employee deactivated' } };
  }

  // --- ATTENDANCE ---
  if (url === '/attendance/check-in' && method === 'post') {
    const newRecord = {
      _id: 'att-' + Date.now(),
      user: currentUser || db.users[2],
      date: new Date().toISOString(),
      checkIn: new Date().toISOString(),
      checkOut: null,
      status: 'Present',
      workHours: 0,
      notes: 'Morning sprint standup',
    };
    db.attendance.unshift(newRecord);
    saveDB(db);
    return { data: { success: true, message: 'Checked in successfully', data: newRecord } };
  }

  if (url === '/attendance/check-out' && method === 'post') {
    const rec = db.attendance[0] || {
      _id: 'att-1',
      user: currentUser || db.users[2],
      date: new Date().toISOString(),
      checkIn: new Date(Date.now() - 8 * 3600000).toISOString(),
    };
    rec.checkOut = new Date().toISOString();
    rec.workHours = 8;
    saveDB(db);
    return { data: { success: true, message: 'Checked out successfully', data: rec } };
  }

  if (url === '/attendance/my' && method === 'get') {
    const today = db.attendance[0] || null;
    return { data: { success: true, count: db.attendance.length, data: db.attendance, today } };
  }

  if (url === '/attendance' && method === 'get') {
    return { data: { success: true, count: db.attendance.length, data: db.attendance } };
  }

  if (url === '/attendance/manual' && method === 'post') {
    const emp = db.employees.find((e) => (e.user?._id || e.user) === data.userId);
    const rec = {
      _id: 'att-' + Date.now(),
      user: emp ? emp.user : currentUser,
      date: new Date(data.date).toISOString(),
      checkIn: new Date().toISOString(),
      checkOut: new Date().toISOString(),
      status: data.status || 'Present',
      workHours: data.workHours || 8,
      notes: data.notes || 'Manually logged by HR',
    };
    db.attendance.unshift(rec);
    saveDB(db);
    return { data: { success: true, message: 'Manual record saved', data: rec } };
  }

  // --- LEAVES ---
  if (url === '/leaves' && method === 'post') {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const newLeave = {
      _id: 'leave-' + Date.now(),
      user: currentUser || db.users[2],
      leaveType: data.leaveType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalDays: days,
      reason: data.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    db.leaves.unshift(newLeave);
    saveDB(db);
    return { data: { success: true, message: 'Leave submitted', data: newLeave } };
  }

  if (url === '/leaves/my' && method === 'get') {
    const userLeaves = db.leaves.filter((l) => (l.user?._id || l.user) === currentUser?._id);
    return { data: { success: true, count: userLeaves.length, data: userLeaves } };
  }

  if (url === '/leaves' && method === 'get') {
    let list = [...db.leaves];
    if (params.status && params.status !== 'All') {
      list = list.filter((l) => l.status === params.status);
    }
    return { data: { success: true, count: list.length, data: list } };
  }

  if (url.startsWith('/leaves/') && method === 'put') {
    const id = url.split('/')[2];
    const leave = db.leaves.find((l) => l._id === id);
    if (leave) {
      leave.status = data.status;
      leave.reviewRemarks = data.reviewRemarks || '';
      leave.reviewedBy = currentUser || { name: 'HR Admin' };
      saveDB(db);
    }
    return { data: { success: true, message: `Leave ${data.status}`, data: leave } };
  }

  if (url.startsWith('/leaves/') && method === 'delete') {
    const id = url.split('/')[2];
    const leave = db.leaves.find((l) => l._id === id);
    if (leave) {
      leave.status = 'Cancelled';
      saveDB(db);
    }
    return { data: { success: true, message: 'Leave cancelled' } };
  }

  // --- ANNOUNCEMENTS ---
  if (url === '/announcements' && method === 'get') {
    let list = [...db.announcements];
    if (params.category && params.category !== 'All') {
      list = list.filter((a) => a.category === params.category);
    }
    return { data: { success: true, count: list.length, data: list } };
  }

  if (url === '/announcements' && method === 'post') {
    const newAnn = {
      _id: 'ann-' + Date.now(),
      title: data.title,
      content: data.content,
      category: data.category || 'General',
      priority: data.priority || 'Medium',
      targetDepartment: data.targetDepartment || 'All',
      postedBy: currentUser || { name: 'HR Management' },
      createdAt: new Date().toISOString(),
    };
    db.announcements.unshift(newAnn);
    saveDB(db);
    return { data: { success: true, message: 'Announcement posted', data: newAnn } };
  }

  if (url.startsWith('/announcements/') && method === 'delete') {
    const id = url.split('/')[2];
    db.announcements = db.announcements.filter((a) => a._id !== id);
    saveDB(db);
    return { data: { success: true, message: 'Announcement deleted' } };
  }

  // --- TRAININGS ---
  if (url === '/trainings' && method === 'get') {
    return { data: { success: true, count: db.trainings.length, data: db.trainings } };
  }

  if (url === '/trainings' && method === 'post') {
    const newTrn = {
      _id: 'trn-' + Date.now(),
      title: data.title,
      description: data.description,
      trainer: data.trainer,
      department: data.department || 'All',
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      capacity: Number(data.capacity) || 25,
      status: 'Upcoming',
      enrolledEmployees: [],
      createdAt: new Date().toISOString(),
    };
    db.trainings.push(newTrn);
    saveDB(db);
    return { data: { success: true, message: 'Training scheduled', data: newTrn } };
  }

  if (url.includes('/enroll') && method === 'post') {
    const id = url.split('/')[2];
    const trn = db.trainings.find((t) => t._id === id);
    if (trn && currentUser) {
      if (!trn.enrolledEmployees.includes(currentUser._id)) {
        trn.enrolledEmployees.push(currentUser._id);
        saveDB(db);
      }
    }
    return { data: { success: true, message: 'Enrolled successfully', data: trn } };
  }

  if (url.startsWith('/trainings/') && method === 'delete') {
    const id = url.split('/')[2];
    db.trainings = db.trainings.filter((t) => t._id !== id);
    saveDB(db);
    return { data: { success: true, message: 'Training deleted' } };
  }

  // --- NOTIFICATIONS ---
  if (url === '/notifications' && method === 'get') {
    return {
      data: {
        success: true,
        unreadCount: db.notifications.filter((n) => !n.isRead).length,
        count: db.notifications.length,
        data: db.notifications,
      },
    };
  }

  if (url === '/notifications/read-all' && method === 'put') {
    db.notifications.forEach((n) => (n.isRead = true));
    saveDB(db);
    return { data: { success: true, message: 'All read' } };
  }

  if (url.startsWith('/notifications/') && method === 'put') {
    const id = url.split('/')[2];
    const n = db.notifications.find((x) => x._id === id);
    if (n) n.isRead = true;
    saveDB(db);
    return { data: { success: true, message: 'Marked read' } };
  }

  return { data: { success: true } };
};
