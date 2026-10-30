import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../redux/slices/announcementSlice';
import Modal from '../components/Modal';
import { Megaphone, Plus, Trash2, Calendar, Tag, ShieldAlert } from 'lucide-react';

const Announcements = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { announcements, isLoading } = useSelector((state) => state.announcements);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    targetDepartment: 'All',
  });

  const isHR = user?.role === 'hr';

  useEffect(() => {
    dispatch(fetchAnnouncements({ category: categoryFilter }));
  }, [dispatch, categoryFilter]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createAnnouncement(formData));
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'Medium',
      targetDepartment: 'All',
    });
    dispatch(fetchAnnouncements({ category: categoryFilter }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      await dispatch(deleteAnnouncement(id));
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Company Announcements & Notices
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Official bulletins, policy updates, and organization-wide events
          </p>
        </div>

        {isHR && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Broadcast Announcement
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['All', 'General', 'Urgent', 'Event', 'Policy'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1" style={{ gap: '1rem' }}>
        {announcements.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>
            No announcements available in this category
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`badge ${item.priority === 'High' ? 'badge-danger' : item.priority === 'Medium' ? 'badge-warning' : 'badge-primary'}`}>
                      {item.priority} Priority
                    </span>
                    <span className="badge badge-gray">{item.category}</span>
                    {item.targetDepartment !== 'All' && (
                      <span className="badge badge-primary">Dept: {item.targetDepartment}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {item.title}
                  </h3>
                </div>

                {isHR && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-danger btn-sm"
                    title="Delete Announcement"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <p style={{ color: 'var(--slate-700)', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {item.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                <span>Posted by: <strong>{item.postedBy?.name || 'HR Management'}</strong></span>
                <span>•</span>
                <span>{new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Company Announcement">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              name="title"
              required
              className="form-control"
              placeholder="e.g. Annual Company Offsite 2026"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="General">General</option>
                <option value="Urgent">Urgent</option>
                <option value="Event">Event</option>
                <option value="Policy">Policy</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Dept.</label>
              <select
                name="targetDepartment"
                className="form-control"
                value={formData.targetDepartment}
                onChange={handleInputChange}
              >
                <option value="All">All Staff</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Content</label>
            <textarea
              name="content"
              required
              rows={4}
              className="form-control"
              placeholder="Write the full announcement details here..."
              value={formData.content}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;
