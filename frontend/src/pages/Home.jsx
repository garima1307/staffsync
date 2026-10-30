import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Clock, Calendar, Users, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Navigation */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 3rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Layers size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            StaffSync
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <ShieldCheck size={16} /> Complete MERN Human Resource Management Platform
        </div>
        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--slate-900)',
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
          }}
        >
          Automate HR Workflows. Empower Teams. Drive Growth.
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--slate-600)',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}
        >
          StaffSync unifies employee records, attendance tracking, leave requests, announcements, and training programs under an intuitive, role-based platform for HR, Managers, and Employees.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            Access Portal <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="btn btn-secondary"
            style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        style={{
          padding: '4rem 2rem 6rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div className="grid grid-cols-3">
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Employee Directory
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Centralized profile management, department mappings, manager hierarchies, emergency contacts, and professional skills tracking.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Attendance & Punctuality
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              One-click check-in and check-out, automated work hours calculation, punctuality monitoring, and HR adjustments.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#fffbeb',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Leave Management
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Seamless leave applications, multi-level manager approvals, status history, and proactive notifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
