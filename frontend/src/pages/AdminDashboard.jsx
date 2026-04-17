import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { useEmployees } from '../context/EmployeeContext';
import Card from '../components/Card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiClock, FiAlertCircle, FiUsers, FiTrendingUp, FiCalendar, FiPlus, FiLayers, FiSun, FiCheck, FiX } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const departmentData = [
  { name: 'Engineering', value: 5, color: '#e8833a' },
  { name: 'HR', value: 3, color: '#3b82f6' },
  { name: 'QA', value: 1, color: '#22c55e' },
  { name: 'Finance', value: 1, color: '#a855f7' },
  { name: 'Marketing', value: 1, color: '#ec4899' },
  { name: 'Design', value: 1, color: '#f59e0b' },
];

const attendanceData = [
  { day: 'Mon', present: 11, absent: 1 },
  { day: 'Tue', present: 10, absent: 2 },
  { day: 'Wed', present: 12, absent: 0 },
  { day: 'Thu', present: 9, absent: 3 },
  { day: 'Fri', present: 11, absent: 1 },
];

const recentActivity = [
  { user: 'John Smith', action: 'applied for Annual Leave', time: '2 hours ago', avatar: 'JS', type: 'apply' },
  { user: 'David Wilson', action: 'Sick Leave was approved', time: '4 hours ago', avatar: 'DW', type: 'approve' },
  { user: 'Amanda Martinez', action: 'applied for Personal Leave', time: '5 hours ago', avatar: 'AM', type: 'apply' },
  { user: 'William Lee', action: 'Annual Leave was rejected', time: '1 day ago', avatar: 'WL', type: 'reject' },
  { user: 'Sarah Johnson', action: 'scheduled Annual Leave', time: '2 days ago', avatar: 'SJ', type: 'info' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { leaves, updateLeaveStatus } = useLeaves();
  const { employees, employeeLoading, fetchEmployees } = useEmployees();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchEmployees().catch((err) => {
      console.error('Failed to fetch employees:', err);
      addToast('Failed to load employee count', 'error');
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchEmployees, addToast]);

  const employeesOnLeave = leaves.filter(
    (l) => l.status === 'Approved' || l.status === 'Taken'
  );
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const quickAdminActions = [
    { label: 'Add Employee', icon: '👤', path: '/pim/add-employee', color: '#e8833a' },
    { label: 'Assign Leave', icon: '📅', path: '/leave/assign', color: '#3b82f6' },
    { label: 'Manage Leave Types', icon: '📂', path: '/leave/types', color: '#22c55e' },
    { label: 'Manage Holidays', icon: '🎉', path: '/leave/holidays', color: '#a855f7' },
  ];

  const handleQuickApprove = (leaveId, empName) => {
    updateLeaveStatus(leaveId, 'Approved', 'Admin quick-approved');
    addToast(`Leave Approved — ${empName}`, 'success');
  };

  const handleQuickReject = (leaveId, empName) => {
    updateLeaveStatus(leaveId, 'Rejected', 'Admin quick-rejected');
    addToast(`Leave Rejected — ${empName}`, 'error');
  };

  const activityTypeColor = {
    apply: '#3b82f6',
    approve: '#22c55e',
    reject: '#ef4444',
    info: '#a855f7',
  };

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

      <div className="dashboard__stats">
        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{employeeLoading ? '...' : employees.length}</span>
            <span className="stat-card__label">Total Employees</span>
          </div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon"><FiCalendar /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{employeesOnLeave.length}</span>
            <span className="stat-card__label">On Leave Today</span>
          </div>
        </div>
        <div className="stat-card stat-card--green" style={{ cursor: 'pointer' }} onClick={() => navigate('/leave/list')}>
          <div className="stat-card__icon"><FiAlertCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{pendingLeaves.length}</span>
            <span className="stat-card__label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card stat-card--purple">
          <div className="stat-card__icon"><FiTrendingUp /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">92%</span>
            <span className="stat-card__label">Attendance Rate</span>
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        <Card title="Quick Admin Actions" icon="⚡" className="dashboard__quick">
          <div className="quick-links">
            {quickAdminActions.map((link) => (
              <Link key={link.label} to={link.path} className="quick-link" style={{ '--link-color': link.color }}>
                <span className="quick-link__icon">{link.icon}</span>
                <span className="quick-link__label">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Employees on Leave Today" icon="🏖️" className="dashboard__leave-today">
          <div className="leave-today-list">
            {employeesOnLeave.length === 0 ? (
              <p className="leave-today__empty">No employees on leave today ✨</p>
            ) : (
              employeesOnLeave.slice(0, 5).map((leave) => (
                <div key={leave.id} className="leave-today__item">
                  <div className="leave-today__avatar">
                    {leave.employeeName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="leave-today__info">
                    <span className="leave-today__name">{leave.employeeName}</span>
                    <span className="leave-today__type">{leave.leaveType} · {leave.fromDate} — {leave.toDate}</span>
                  </div>
                  <span className={`status-badge status-badge--${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Leave Requests with quick approve/reject */}
        <Card title={`Pending Leave Requests (${pendingLeaves.length})`} icon="⏳" className="dashboard__leave-today">
          <div className="leave-today-list">
            {pendingLeaves.length === 0 ? (
              <p className="leave-today__empty">No pending requests ✨</p>
            ) : (
              pendingLeaves.slice(0, 5).map((leave) => (
                <div key={leave.id} className="leave-today__item">
                  <div className="leave-today__avatar">
                    {leave.employeeName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="leave-today__info">
                    <span className="leave-today__name">{leave.employeeName}</span>
                    <span className="leave-today__type">{leave.leaveType} · {leave.fromDate} — {leave.toDate} · {leave.duration} day(s)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-action btn-action--edit"
                      title="Approve"
                      onClick={() => handleQuickApprove(leave.id, leave.employeeName)}
                    >
                      <FiCheck />
                    </button>
                    <button
                      className="btn-action btn-action--delete"
                      title="Reject"
                      onClick={() => handleQuickReject(leave.id, leave.employeeName)}
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Recent Activity Feed" icon="💬" className="dashboard__buzz">
          <div className="buzz-feed">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="buzz-item">
                <div
                  className="buzz-item__avatar"
                  style={{ background: `linear-gradient(135deg, ${activityTypeColor[item.type]}, ${activityTypeColor[item.type]}cc)` }}
                >
                  {item.avatar}
                </div>
                <div className="buzz-item__content">
                  <div className="buzz-item__header">
                    <span className="buzz-item__user">{item.user}</span>
                    <span className="buzz-item__time">{item.time}</span>
                  </div>
                  <p className="buzz-item__message">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Department Distribution" icon="📊" className="dashboard__chart-pie">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Weekly Attendance" icon="📈" className="dashboard__chart-bar">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
              <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
