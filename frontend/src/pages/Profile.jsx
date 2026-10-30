import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../redux/slices/authSlice';
import api from '../services/api';
import { User, Mail, Phone, Building, Briefcase, Calendar, Shield, Save, KeyRound } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, profileDetails } = useSelector((state) => state.auth);

  const [personalData, setPersonalData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    skills: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.name || '',
        phone: user.phone || '',
        street: profileDetails?.address?.street || '',
        city: profileDetails?.address?.city || '',
        state: profileDetails?.address?.state || '',
        zipCode: profileDetails?.address?.zipCode || '',
        emergencyName: profileDetails?.emergencyContact?.name || '',
        emergencyRelation: profileDetails?.emergencyContact?.relationship || '',
        emergencyPhone: profileDetails?.emergencyContact?.phone || '',
        skills: profileDetails?.skills?.join(', ') || '',
      });
    }
  }, [user, profileDetails]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', {
        name: personalData.name,
        phone: personalData.phone,
        address: {
          street: personalData.street,
          city: personalData.city,
          state: personalData.state,
          zipCode: personalData.zipCode,
        },
        emergencyContact: {
          name: personalData.emergencyName,
          relationship: personalData.emergencyRelation,
          phone: personalData.emergencyPhone,
        },
        skills: personalData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setStatusMessage({ type: 'success', text: 'Profile details updated successfully!' });
      dispatch(getMe());
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setStatusMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Password update failed' });
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          My Profile & Settings
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
          Manage your personal information, contact records, and security preferences
        </p>
      </div>

      {statusMessage.text && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: statusMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
          }}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-3">
        {/* Left Column: Summary Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              {user?.name?.charAt(0)}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              {user?.name}
            </h2>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '2px' }}>
              {user?.designation}
            </div>

            <span
              className={`badge ${user?.role === 'hr' ? 'badge-primary' : user?.role === 'manager' ? 'badge-warning' : 'badge-success'}`}
              style={{ marginTop: '0.5rem' }}
            >
              {user?.role?.toUpperCase()}
            </span>

            <div style={{ marginTop: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                <Mail size={16} color="var(--slate-400)" /> {user?.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                <Building size={16} color="var(--slate-400)" /> {user?.department}
              </div>
              {profileDetails?.employeeId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                  <Shield size={16} color="var(--slate-400)" /> ID: {profileDetails.employeeId}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Details & Security */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Edit Profile Information */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Personal & Contact Details</span>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.name}
                      onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.phone}
                      onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={personalData.street}
                    onChange={(e) => setPersonalData({ ...personalData, street: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.city}
                      onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.state}
                      onChange={(e) => setPersonalData({ ...personalData, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.zipCode}
                      onChange={(e) => setPersonalData({ ...personalData, zipCode: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: '1rem 0 0.75rem', color: 'var(--slate-800)' }}>
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.emergencyName}
                      onChange={(e) => setPersonalData({ ...personalData, emergencyName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.emergencyRelation}
                      onChange={(e) => setPersonalData({ ...personalData, emergencyRelation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalData.emergencyPhone}
                      onChange={(e) => setPersonalData({ ...personalData, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, Python, Leadership"
                    value={personalData.skills}
                    onChange={(e) => setPersonalData({ ...personalData, skills: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Security */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Security & Password</span>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="form-control"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-secondary">
                    <KeyRound size={16} /> Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
