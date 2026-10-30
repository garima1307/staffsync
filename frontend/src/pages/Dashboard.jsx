import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { fetchEmployeeStats } from '../redux/slices/employeeSlice';
import { fetchMyAttendance, checkInUser, checkOutUser } from '../redux/slices/attendanceSlice';
import { fetchAnnouncements } from '../redux/slices/announcementSlice';
import { fetchMyLeaves, fetchAllLeaves } from '../redux/slices/leaveSlice';
import { fetchTrainings } from '../redux/slices/trainingSlice';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.employees);
  const { todayRecord, myRecords } = useSelector((state) => state.attendance);
  const { announcements } = useSelector((state) => state.announcements);
  const { myLeaves, allLeaves } = useSelector((state) => state.leaves);
  const { trainings } = useSelector((state) => state.trainings);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchAnnouncements());
    dispatch(fetchTrainings());

    if (user?.role === 'hr') {
      dispatch(fetchEmployeeStats());
      dispatch(fetchAllLeaves({ status: 'Pending' }));
    } else if (user?.role === 'manager') {
      dispatch(fetchEmployeeStats());
      dispatch(fetchAllLeaves({ status: 'Pending' }));
      dispatch(fetchMyAttendance());
    } else {
      dispatch(fetchMyAttendance());
      dispatch(fetchMyLeaves());
    }
  }, [dispatch, user]);

  const handleCheckIn = () => {
    dispatch(checkInUser());
  };

  const handleCheckOut = () => {
    dispatch(checkOutUser());
  };

  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 2.5rem',
          color: 'white',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {user?.role?.toUpperCase()} PORTAL
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {user?.name}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
            {user?.designation} • {user?.department} Department
          </p>
        </div>

        {/* Real-time Clock & Status */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 600 }}>
            System Time
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            {currentTime}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* HRM Analytics Grid (HR / Manager) */}
      {(isHR || isManager) && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees ?? '...'}
            subtitle="Active on payroll"
            icon={Users}
            color="var(--primary)"
          />
          <StatCard
            title="Present Today"
            value={stats?.presentToday ?? '0'}
            subtitle="Checked-in workforce"
            icon={CalendarCheck}
            color="var(--success)"
          />
          <StatCard
            title="Pending Leaves"
            value={stats?.pendingLeaves ?? allLeaves.length}
            subtitle="Awaiting management review"
            icon={CalendarDays}
            color="var(--warning)"
          />
          <StatCard
            title="Active Programs"
            value={trainings.length}
            subtitle="Training & development"
            icon={GraduationCap}
            color="var(--secondary)"
          />
        </div>
      )}

      {/* Employee Quick Attendance & Metrics */}
      {!isHR && (
        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          {/* Quick Check-In / Out Card */}
          <div className="card" style={{ gridColumn: isManager ? 'span 1' : 'span 1' }}>
            <div className="card-header">
              <span className="card-title">Daily Attendance</span>
              <Clock size={18} color="var(--primary)" />
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.25rem' }}>
                  Today's Status
                </div>
                {todayRecord ? (
                  <span className={`badge ${todayRecord.status === 'Present' ? 'badge-success' : 'badge-warning'}`}>
                    {todayRecord.status}
                  </span>
                ) : (
                  <span className="badge badge-gray">Not Checked In</span>
                )}
              </div>

              {todayRecord?.checkIn && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                  Checked in at: <strong>{new Date(todayRecord.checkIn).toLocaleTimeString()}</strong>
                </div>
              )}

              {todayRecord?.checkOut && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                  Checked out at: <strong>{new Date(todayRecord.checkOut).toLocaleTimeString()}</strong>
                  <br />
                  Total Hours: <strong>{todayRecord.workHours} hrs</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleCheckIn}
                  disabled={!!todayRecord?.checkIn}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={16} /> Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Clock size={16} /> Check Out
                </button>
              </div>
            </div>
          </div>

          <StatCard
            title="My Leave Requests"
            value={myLeaves.length}
            subtitle={`${myLeaves.filter((l) => l.status === 'Approved').length} approved this year`}
            icon={CalendarDays}
            color="var(--warning)"
          />

          <StatCard
            title="Training Programs"
            value={trainings.length}
            subtitle="Available skill courses"
            icon={GraduationCap}
            color="var(--secondary)"
          />
        </div>
      )}

      {/* Main Content Split: Announcements + Leaves / Actions */}
      <div className="grid grid-cols-2">
        {/* Company Announcements */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={18} color="var(--primary)" />
              <span className="card-title">Company Announcements</span>
            </div>
            <Link to="/announcements" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              View all
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.length === 0 ? (
              <div style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '1.5rem 0' }}>
                No active announcements
              </div>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-100)',
                    background: 'var(--slate-50)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--slate-900)' }}>
                      {a.title}
                    </span>
                    <span className={`badge ${a.priority === 'High' ? 'badge-danger' : a.priority === 'Medium' ? 'badge-warning' : 'badge-primary'}`}>
                      {a.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                    {a.content}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
                    Posted by {a.postedBy?.name || 'HR Team'} • {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Approvals (HR / Manager) or My Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={18} color="var(--warning)" />
              <span className="card-title">
                {isHR || isManager ? 'Pending Leave Requests' : 'Upcoming Trainings'}
              </span>
            </div>
            <Link to={isHR || isManager ? '/leaves' : '/trainings'} style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              Manage
            </Link>
          </div>
          <div className="card-body">
            {isHR || isManager ? (
              allLeaves.filter((l) => l.status === 'Pending').length === 0 ? (
                <div style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem 0' }}>
                  No pending leaves waiting for approval
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {allLeaves.filter((l) => l.status === 'Pending').slice(0, 4).map((l) => (
                    <div
                      key={l._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--slate-50)',
                        border: '1px solid var(--slate-100)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {l.user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {l.leaveType} Leave • {l.totalDays} day(s)
                        </div>
                      </div>
                      <Link to="/leaves" className="btn btn-secondary btn-sm">
                        Review <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              )
            ) : (
              trainings.length === 0 ? (
                <div style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem 0' }}>
                  No training programs scheduled
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {trainings.slice(0, 3).map((t) => (
                    <div
                      key={t._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--slate-50)',
                        border: '1px solid var(--slate-100)',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                        Trainer: {t.trainer} • Starts: {new Date(t.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
