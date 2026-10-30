import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, resetAuthStatus } from '../redux/slices/authSlice';
import { Layers, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(resetAuthStatus());
    };
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  // Demo account quick filler
  const setDemoAccount = (role) => {
    if (role === 'hr') {
      setEmail('hr@staffsync.com');
      setPassword('admin123');
    } else if (role === 'manager') {
      setEmail('manager@staffsync.com');
      setPassword('manager123');
    } else if (role === 'employee') {
      setEmail('employee@staffsync.com');
      setPassword('employee123');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        padding: '1.5rem',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--primary)',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '0.75rem',
            }}
          >
            <Layers size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Sign In to StaffSync
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Human Resource Management System
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {isError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                fontWeight: 500,
              }}
            >
              {message || 'Invalid email or password'}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-100)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
              One-Click Demo Roles
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDemoAccount('hr')}
                className="btn btn-secondary btn-sm"
                style={{ flexDirection: 'column', gap: '0.25rem', padding: '0.5rem' }}
              >
                <ShieldCheck size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.75rem' }}>HR Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('manager')}
                className="btn btn-secondary btn-sm"
                style={{ flexDirection: 'column', gap: '0.25rem', padding: '0.5rem' }}
              >
                <Briefcase size={16} color="var(--warning)" />
                <span style={{ fontSize: '0.75rem' }}>Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('employee')}
                className="btn btn-secondary btn-sm"
                style={{ flexDirection: 'column', gap: '0.25rem', padding: '0.5rem' }}
              >
                <UserCheck size={16} color="var(--success)" />
                <span style={{ fontSize: '0.75rem' }}>Employee</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
