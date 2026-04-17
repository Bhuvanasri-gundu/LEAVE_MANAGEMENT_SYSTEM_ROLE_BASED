import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';
import Card from '../components/Card';
import { FiMail, FiPhone, FiBriefcase, FiMapPin, FiUser, FiCalendar, FiUsers } from 'react-icons/fi';
import './Pages.css';

export default function MyInfo() {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMe();
        setPersonalInfo(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load personal information');
        console.error('Failed to fetch personal info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page__header">
          <h2 className="page__title">My Information</h2>
        </div>
        <Card title="Personal Details" icon="👤">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner spinner--large" style={{ margin: '0 auto 20px' }} />
            <p>Loading your information...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page__header">
          <h2 className="page__title">My Information</h2>
        </div>
        <Card title="Error" icon="⚠️">
          <div style={{ color: '#ef4444', padding: '20px' }}>
            {error}
          </div>
        </Card>
      </div>
    );
  }

  const info = personalInfo || user;

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">My Information</h2>
      </div>

      <Card title="Personal Details" icon="👤">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {/* Name */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiUser style={{ fontSize: '16px', color: '#e8833a' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Full Name</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.firstName} {info?.lastName}
            </p>
          </div>

          {/* Employee ID */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiBriefcase style={{ fontSize: '16px', color: '#3b82f6' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Employee ID</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.employeeId || info?.id || '—'}
            </p>
          </div>

          {/* Email */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiMail style={{ fontSize: '16px', color: '#22c55e' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Email</label>
            </div>
            <p style={{ fontSize: '14px', color: '#1f2937', margin: 0, wordBreak: 'break-all' }}>
              {info?.email || '—'}
            </p>
          </div>

          {/* Phone */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiPhone style={{ fontSize: '16px', color: '#a855f7' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Phone</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.phone || '—'}
            </p>
          </div>

          {/* Role */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiBriefcase style={{ fontSize: '16px', color: '#f59e0b' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Role</label>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
              <span 
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: info?.role === 'Admin' ? '#fee2e2' : info?.role === 'Manager' ? '#dbeafe' : '#dcfce7',
                  color: info?.role === 'Admin' ? '#991b1b' : info?.role === 'Manager' ? '#1e40af' : '#166534',
                }}
              >
                {info?.role || '—'}
              </span>
            </p>
          </div>

          {/* Job Title */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiBriefcase style={{ fontSize: '16px', color: '#ec4899' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Job Title</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.jobTitle || '—'}
            </p>
          </div>

          {/* Department */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiMapPin style={{ fontSize: '16px', color: '#06b6d4' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Department</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.department || '—'}
            </p>
          </div>

          {/* Team */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiUsers style={{ fontSize: '16px', color: '#8b5cf6' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Team</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.team || '—'}
            </p>
          </div>

          {/* Supervisor */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiUser style={{ fontSize: '16px', color: '#f97316' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Supervisor</label>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 }}>
              {info?.supervisor || '—'}
            </p>
          </div>

          {/* Employment Status */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiBriefcase style={{ fontSize: '16px', color: '#84cc16' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Employment Status</label>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
              <span 
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                }}
              >
                {info?.employmentStatus || '—'}
              </span>
            </p>
          </div>

          {/* Join Date */}
          <div className="info-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiCalendar style={{ fontSize: '16px', color: '#6366f1' }} />
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Join Date</label>
            </div>
            <p style={{ fontSize: '14px', color: '#1f2937', margin: 0 }}>
              {info?.joinDate ? new Date(info.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
