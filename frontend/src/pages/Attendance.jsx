import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkInUser,
  checkOutUser,
  fetchMyAttendance,
  fetchAllAttendance,
  clearAttendanceStatus,
} from '../redux/slices/attendanceSlice';
import { fetchEmployees } from '../redux/slices/employeeSlice';
import Modal from '../components/Modal';
import api from '../services/api';
import { CalendarCheck, Clock, CheckCircle, Calendar, Plus, UserCheck } from 'lucide-react';

const Attendance = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myRecords, todayRecord, allRecords, isLoading } = useSelector((state) => state.attendance);
  const { employees } = useSelector((state) => state.employees);

  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const [manualData, setManualData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    workHours: 8,
    notes: 'Manually logged by HR',
  });

  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchMyAttendance());
    if (isHR || isManager) {
      dispatch(fetchAllAttendance({ date: dateFilter, department: departmentFilter }));
      if (isHR) {
        dispatch(fetchEmployees());
      }
    }
  }, [dispatch, user, dateFilter, departmentFilter, isHR, isManager]);

  const handleCheckIn = () => {
    dispatch(checkInUser());
  };

  const handleCheckOut = () => {
    dispatch(checkOutUser());
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/manual', manualData);
      setIsManualModalOpen(false);
      dispatch(fetchAllAttendance({ date: dateFilter, department: departmentFilter }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating attendance');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Attendance Tracking
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Daily check-in logs, punctuality metrics, and work duration tracking
          </p>
        </div>

        {isHR && (
          <button onClick={() => setIsManualModalOpen(true)} className="btn btn-secondary">
            <Plus size={16} /> Manual Attendance Entry
          </button>
        )}
      </div>

      {/* Check In / Out Clock Widget */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>
              TODAY'S CLOCK STATUS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span className={`badge ${todayRecord?.status === 'Present' ? 'badge-success' : todayRecord?.status === 'Late' ? 'badge-warning' : 'badge-gray'}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
                {todayRecord ? todayRecord.status : 'Not Clocked In'}
              </span>
              {todayRecord?.checkIn && (
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                  In: <strong>{new Date(todayRecord.checkIn).toLocaleTimeString()}</strong>
                </span>
              )}
              {todayRecord?.checkOut && (
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                  Out: <strong>{new Date(todayRecord.checkOut).toLocaleTimeString()}</strong> ({todayRecord.workHours} hrs)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleCheckIn}
              disabled={!!todayRecord?.checkIn}
              className="btn btn-primary"
            >
              <CheckCircle size={18} /> Clock In Now
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
              className="btn btn-secondary"
            >
              <Clock size={18} /> Clock Out
            </button>
          </div>
        </div>
      </div>

      {/* Admin/Manager Filter bar */}
      {(isHR || isManager) && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', display: 'block', marginBottom: '4px' }}>
                FILTER BY DATE
              </label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div style={{ width: '220px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', display: 'block', marginBottom: '4px' }}>
                DEPARTMENT
              </label>
              <select
                className="form-control"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {isHR ? 'Company Attendance Logs' : isManager ? 'Team Attendance Records' : 'My Attendance History'}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {(isHR || isManager) && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {((isHR || isManager) ? allRecords : myRecords).length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    No attendance records found
                  </td>
                </tr>
              ) : (
                ((isHR || isManager) ? allRecords : myRecords).map((rec) => (
                  <tr key={rec._id}>
                    {(isHR || isManager) && (
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {rec.user?.name || 'Employee'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {rec.user?.department}
                        </div>
                      </td>
                    )}
                    <td style={{ fontWeight: 500 }}>
                      {new Date(rec.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '—'}</td>
                    <td>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{rec.workHours ? `${rec.workHours} hrs` : '—'}</td>
                    <td>
                      <span className={`badge ${rec.status === 'Present' ? 'badge-success' : rec.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{rec.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal for HR */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Manual Attendance Record">
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select
              required
              className="form-control"
              value={manualData.userId}
              onChange={(e) => setManualData({ ...manualData, userId: e.target.value })}
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.user?._id} value={emp.user?._id}>
                  {emp.user?.name} ({emp.employeeId}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="form-control"
                value={manualData.date}
                onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={manualData.status}
                onChange={(e) => setManualData({ ...manualData, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
                <option value="On-Leave">On-Leave</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Work Hours</label>
            <input
              type="number"
              step="0.5"
              className="form-control"
              value={manualData.workHours}
              onChange={(e) => setManualData({ ...manualData, workHours: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">HR Adjustment Note</label>
            <input
              type="text"
              className="form-control"
              value={manualData.notes}
              onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsManualModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
