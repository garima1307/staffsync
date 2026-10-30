import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrainings,
  createTraining,
  enrollTraining,
  deleteTraining,
} from '../redux/slices/trainingSlice';
import Modal from '../components/Modal';
import { GraduationCap, Plus, Users, Calendar, Trash2, CheckCircle2 } from 'lucide-react';

const Trainings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { trainings, isLoading } = useSelector((state) => state.trainings);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer: '',
    department: 'All',
    startDate: '',
    endDate: '',
    capacity: 25,
  });

  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchTrainings());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createTraining(formData));
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      trainer: '',
      department: 'All',
      startDate: '',
      endDate: '',
      capacity: 25,
    });
    dispatch(fetchTrainings());
  };

  const handleEnroll = async (id) => {
    await dispatch(enrollTraining(id));
    dispatch(fetchTrainings());
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this training course?')) {
      await dispatch(deleteTraining(id));
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Training & Development
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Upskill teams through professional workshops, technical bootcamps, and certifications
          </p>
        </div>

        {(isHR || isManager) && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Schedule Training Program
          </button>
        )}
      </div>

      <div className="grid grid-cols-2">
        {trainings.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>
            No training programs currently scheduled
          </div>
        ) : (
          trainings.map((t) => {
            const isEnrolled = t.enrolledEmployees?.some(
              (emp) => (emp._id || emp) === user?._id
            );
            const enrolledCount = t.enrolledEmployees?.length || 0;
            const isFull = enrolledCount >= t.capacity;

            return (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>
                      {t.department}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {t.title}
                    </h3>
                  </div>
                  {(isHR || isManager) && (
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="btn btn-danger btn-sm"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {t.description}
                  </p>

                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block' }}>Trainer:</span>
                        <strong style={{ color: 'var(--slate-800)' }}>{t.trainer}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block' }}>Schedule:</span>
                        <strong style={{ color: 'var(--slate-800)' }}>
                          {new Date(t.startDate).toLocaleDateString()}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block' }}>Enrolled:</span>
                        <strong style={{ color: 'var(--slate-800)' }}>
                          {enrolledCount} / {t.capacity} Seats
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block' }}>Status:</span>
                        <span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          background: 'var(--success-light)',
                          color: 'var(--success)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        <CheckCircle2 size={16} /> Enrolled
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(t._id)}
                        disabled={isFull}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        {isFull ? 'Program Full' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Training Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Schedule Training Course">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Training Title</label>
            <input
              type="text"
              name="title"
              required
              className="form-control"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Trainer Name / Org</label>
              <input
                type="text"
                name="trainer"
                required
                className="form-control"
                value={formData.trainer}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Department</label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                required
                className="form-control"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                required
                className="form-control"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Seats</label>
              <input
                type="number"
                name="capacity"
                className="form-control"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Syllabus</label>
            <textarea
              name="description"
              required
              rows={3}
              className="form-control"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Training
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Trainings;
