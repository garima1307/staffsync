import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyLeaves,
  fetchAllLeaves,
  applyLeave,
  updateLeaveStatus,
  cancelLeave,
} from '../redux/slices/leaveSlice';
import Modal from '../components/Modal';
import { CalendarDays, Plus, Check, X, AlertCircle } from 'lucide-react';

const Leaves = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myLeaves, allLeaves, isLoading } = useSelector((state) => state.leaves);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchMyLeaves());
    if (isHR || isManager) {
      dispatch(fetchAllLeaves({ status: statusFilter }));
    }
  }, [dispatch, user, statusFilter, isHR, isManager]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    await dispatch(applyLeave(formData));
    setIsApplyModalOpen(false);
    setFormData({
      leaveType: 'Annual',
      startDate: '',
      endDate: '',
      reason: '',
    });
    dispatch(fetchMyLeaves());
  };

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewRemarks('');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (selectedLeave) {
      await dispatch(
        updateLeaveStatus({
          id: selectedLeave._id,
          status: reviewAction,
          reviewRemarks,
        })
      );
      setIsReviewModalOpen(false);
      dispatch(fetchAllLeaves({ status: statusFilter }));
    }
  };

  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      await dispatch(cancelLeave(id));
      dispatch(fetchMyLeaves());
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Leave Management
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Submit time-off requests, track approval status, and manage team absences
          </p>
        </div>

        <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Admin / Manager Review Section */}
      {(isHR || isManager) && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <span className="card-title">
              {isHR ? 'Company-wide Leave Applications' : 'Team Leave Requests'}
            </span>
            <div style={{ width: '180px' }}>
              <select
                className="form-control"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates & Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  allLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {l.user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {l.user?.department}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{l.leaveType}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {l.totalDays} day(s)
                        </div>
                      </td>
                      <td style={{ maxWidth: '240px', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                        {l.reason}
                      </td>
                      <td>
                        <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openReviewModal(l, 'Approved')}
                              className="btn btn-success btn-sm"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(l, 'Rejected')}
                              className="btn btn-danger btn-sm"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                            Reviewed by {l.reviewedBy?.name || 'Manager'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Personal Leaves Section */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Leave History</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Total Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                    You have not submitted any leave requests yet
                  </td>
                </tr>
              ) : (
                myLeaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <span className="badge badge-primary">{l.leaveType}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td>{l.totalDays} day(s)</td>
                    <td style={{ maxWidth: '220px', fontSize: '0.8125rem' }}>{l.reason}</td>
                    <td>
                      <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : l.status === 'Cancelled' ? 'badge-gray' : 'badge-warning'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                      {l.reviewRemarks || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelLeave(l._id)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label">Leave Category</label>
            <select
              className="form-control"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              <option value="Annual">Annual / Vacation Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Maternity">Maternity / Parental</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Request</label>
            <textarea
              required
              rows={3}
              className="form-control"
              placeholder="Provide a clear explanation for this leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsApplyModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Remarks Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`${reviewAction} Leave Request`}>
        <form onSubmit={handleReviewSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
            You are about to mark <strong>{selectedLeave?.user?.name}'s</strong> leave request as <strong>{reviewAction.toUpperCase()}</strong>.
          </p>

          <div className="form-group">
            <label className="form-label">Manager Remarks (Optional)</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Add any feedback or approval notes..."
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'}`}
            >
              Confirm {reviewAction}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
