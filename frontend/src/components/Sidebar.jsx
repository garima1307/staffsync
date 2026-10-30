import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  GraduationCap,
  UserCheck,
  Layers,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Layers size={22} />
        </div>
        <div className="sidebar-brand">
          Staff<span>Sync</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {(isHR || isManager) && (
          <NavLink
            to="/employees"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>{isHR ? 'Employees' : 'Team Members'}</span>
          </NavLink>
        )}

        <NavLink
          to="/attendance"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <CalendarCheck size={20} />
          <span>Attendance</span>
        </NavLink>

        <NavLink
          to="/leaves"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <CalendarDays size={20} />
          <span>Leave Requests</span>
        </NavLink>

        <NavLink
          to="/announcements"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Megaphone size={20} />
          <span>Announcements</span>
        </NavLink>

        <NavLink
          to="/trainings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <GraduationCap size={20} />
          <span>Training & Growth</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <UserCheck size={20} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            color: 'var(--slate-400)',
          }}
        >
          <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: '2px' }}>
            StaffSync v1.0
          </div>
          <div>MERN Enterprise HRM</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
