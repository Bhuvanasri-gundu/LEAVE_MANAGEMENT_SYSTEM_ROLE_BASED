import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useLeaves } from '../context/LeaveContext';
import Card from '../components/Card';
import { getHolidays } from '../services/api';
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle, FiAward, FiStar, FiSun, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { leaves } = useLeaves();
  const [holidays, setHolidays] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const myLeaves = leaves.filter((l) => l.employeeId === user.id);

  useEffect(() => {
    const fetchData = async () => {
      const holidayRes = await getHolidays();
      const today = new Date().toISOString().split('T')[0];
      const upcoming = holidayRes.data
        .filter((h) => h.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
      setHolidays(upcoming);
    };
    fetchData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const leaveBalance = {
    annual: { total: 15, used: myLeaves.filter((l) => l.leaveType === 'Annual Leave' && (l.status === 'Approved' || l.status === 'Taken')).reduce((sum, l) => sum + parseFloat(l.duration), 0) },
    sick: { total: 10, used: myLeaves.filter((l) => l.leaveType === 'Sick Leave' && (l.status === 'Approved' || l.status === 'Taken')).reduce((sum, l) => sum + parseFloat(l.duration), 0) },
    personal: { total: 5, used: myLeaves.filter((l) => l.leaveType === 'Personal Leave' && (l.status === 'Approved' || l.status === 'Taken')).reduce((sum, l) => sum + parseFloat(l.duration), 0) },
  };

  const pendingCount = myLeaves.filter((l) => l.status === 'Pending').length;
  const recentLeaves = myLeaves.slice(-5).reverse();

  // Badge Logic
  const badges = useMemo(() => {
    const earned = [];
    
    // Perfect Attendance: No Sick Leaves taken/approved
    if (leaveBalance.sick.used === 0) {
      earned.push({ name: 'Perfect Attendance', icon: <FiStar />, color: '#fbbf24', desc: 'No sick leaves taken!' });
    }
    
    // Balanced Usage: Has used both annual and at least one other type, AND all balances >= 0
    const allBalancesPositive = 
      (leaveBalance.annual.total - leaveBalance.annual.used >= 0) &&
      (leaveBalance.sick.total - leaveBalance.sick.used >= 0) &&
      (leaveBalance.personal.total - leaveBalance.personal.used >= 0);
    if (allBalancesPositive && leaveBalance.annual.used > 0 && (leaveBalance.sick.used > 0 || leaveBalance.personal.used > 0)) {
      earned.push({ name: 'Balanced Usage', icon: <FiSun />, color: '#38bdf8', desc: 'Balanced leave types.' });
    }
    
    // Early Planner: Any leave applied 3+ days in advance
    const hasEarlyPlan = myLeaves.some(l => {
      if (!l.appliedDate || !l.fromDate) return false;
      const applied = new Date(l.appliedDate);
      const from = new Date(l.fromDate);
      return (from - applied) / (1000 * 60 * 60 * 24) >= 3;
    });
    if (hasEarlyPlan) {
      earned.push({ name: 'Early Planner', icon: <FiCalendar />, color: '#a78bfa', desc: 'Applied ≥ 3 days early.' });
    }
    
    // Frequent Leave: More than 5 total leaves applied
    if (myLeaves.length > 5) {
      earned.push({ name: 'Frequent Leave', icon: <FiTrendingUp />, color: '#fb7185', desc: 'Vocal about time off!' });
    }
    
    return earned;
  }, [leaveBalance, myLeaves]);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatHolidayDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const balanceCards = [
    {
      type: 'Annual Leave',
      total: leaveBalance.annual.total,
      used: leaveBalance.annual.used,
      remaining: Math.max(0, leaveBalance.annual.total - leaveBalance.annual.used),
      color: '#e8833a',
      bgGradient: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
    },
    {
      type: 'Sick Leave',
      total: leaveBalance.sick.total,
      used: leaveBalance.sick.used,
      remaining: Math.max(0, leaveBalance.sick.total - leaveBalance.sick.used),
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #eff6ff, #bfdbfe)',
    },
    {
      type: 'Personal Leave',
      total: leaveBalance.personal.total,
      used: leaveBalance.personal.used,
      remaining: Math.max(0, leaveBalance.personal.total - leaveBalance.personal.used),
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <div>
          <h2 className="dashboard__greeting">Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="dashboard__date">{formatDate(currentTime)}</p>
        </div>
        <div className="dashboard__time-display">
          <FiClock className="dashboard__time-icon" />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {badges.length > 0 && (
        <Card title={`My Achievements (${badges.length})`} icon="🏆" className="mb-20">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.name} style={{
                background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 200px'
              }}>
                <div style={{ background: b.color, color: 'white', padding: '10px', borderRadius: '50%', display: 'flex', flexShrink: 0 }}>
                  {b.icon}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#111827' }}>{b.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="dashboard__stats">
        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon"><FiCalendar /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{Math.max(0, leaveBalance.annual.total - leaveBalance.annual.used)}</span>
            <span className="stat-card__label">Annual Leave Left</span>
          </div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon"><FiCheckCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{Math.max(0, leaveBalance.sick.total - leaveBalance.sick.used)}</span>
            <span className="stat-card__label">Sick Leave Left</span>
          </div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__icon"><FiCheckCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{Math.max(0, leaveBalance.personal.total - leaveBalance.personal.used)}</span>
            <span className="stat-card__label">Personal Leave Left</span>
          </div>
        </div>
        <div className="stat-card stat-card--purple">
          <div className="stat-card__icon"><FiAlertCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{pendingCount}</span>
            <span className="stat-card__label">Pending Requests</span>
          </div>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="leave-balance-row">
        {balanceCards.map((card) => (
          <div key={card.type} className="balance-modern-card">
            <div className="balance-modern-card__header">
              <span className="balance-modern-card__type">{card.type}</span>
              <span className="balance-modern-card__total">Goal: {card.total}</span>
            </div>
            
            <div className="balance-modern-card__progress">
              <div 
                className="balance-modern-card__progress-fill"
                style={{ 
                  width: `${(card.used / card.total) * 100}%`, 
                  background: card.color 
                }}
              />
            </div>

            <div className="balance-modern-card__stats">
              <div className="balance-stat-item">
                <span className="balance-stat-item__label">Used</span>
                <span className="balance-stat-item__value" style={{ color: card.color }}>{card.used}</span>
              </div>
              <div className="divider-v" />
              <div className="balance-stat-item">
                <span className="balance-stat-item__label">Remaining</span>
                <span className="balance-stat-item__value">{card.remaining}</span>
              </div>
              <div className="divider-v" />
              <div className="balance-stat-item">
                <span className="balance-stat-item__label">Total</span>
                <span className="balance-stat-item__value">{card.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard__grid">
        <Card title="Quick Actions" icon="🚀" className="dashboard__quick">
          <div className="quick-links">
            <Link to="/leave/apply" className="quick-link" style={{ '--link-color': '#e8833a' }}>
              <span className="quick-link__icon">✈️</span>
              <span className="quick-link__label">Apply Leave</span>
            </Link>
            <Link to="/leave/my-leaves" className="quick-link" style={{ '--link-color': '#3b82f6' }}>
              <span className="quick-link__icon">📋</span>
              <span className="quick-link__label">My Leaves</span>
            </Link>
            <Link to="/leave/holidays" className="quick-link" style={{ '--link-color': '#22c55e' }}>
              <span className="quick-link__icon">🎉</span>
              <span className="quick-link__label">Holidays</span>
            </Link>
            <Link to="/my-info" className="quick-link" style={{ '--link-color': '#a855f7' }}>
              <span className="quick-link__icon">👤</span>
              <span className="quick-link__label">My Info</span>
            </Link>
          </div>
        </Card>

        <Card title="My Recent Leave Requests" icon="📋" className="dashboard__leave-today">
          <div className="leave-today-list">
            {recentLeaves.length === 0 ? (
              <p className="leave-today__empty">No leave requests yet</p>
            ) : (
              recentLeaves.map((leave) => (
                <div key={leave.id} className="leave-modern-item">
                  <div className="leave-modern-item__main">
                    <div className="leave-modern-item__icon" style={{ background: `linear-gradient(135deg, ${leave.status === 'Approved' ? '#22c55e' : leave.status === 'Rejected' ? '#ef4444' : '#f59e0b'}, #9ca3af)` }}>
                      {leave.leaveType[0]}
                    </div>
                    <div className="leave-modern-item__content">
                      <div className="leave-modern-item__title-row">
                        <span className="leave-modern-item__name">{leave.leaveType}</span>
                        <span className={`status-badge status-badge--${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="leave-modern-item__meta">
                        <span>{leave.fromDate} — {leave.toDate}</span>
                        <span className="dot">•</span>
                        <span>{leave.duration} day(s)</span>
                      </div>
                      {leave.managerComment && (
                        <div className="leave-modern-item__comment">
                          " {leave.managerComment} "
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Upcoming Holidays" icon="🎉" className="dashboard__buzz">
          <div className="leave-today-list">
            {holidays.length === 0 ? (
              <p className="leave-today__empty">No upcoming holidays</p>
            ) : (
              holidays.slice(0, 6).map((holiday) => (
                <div key={holiday.id} className="leave-today__item">
                  <div className="leave-today__avatar" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    🎄
                  </div>
                  <div className="leave-today__info">
                    <span className="leave-today__name">{holiday.name}</span>
                    <span className="leave-today__type">{formatHolidayDate(holiday.date)} · {holiday.length}</span>
                  </div>
                  {holiday.recurring && (
                     <span className="status-badge status-badge--approved">Recurring</span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
