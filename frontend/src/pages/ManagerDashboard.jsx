import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useLeaves } from '../context/LeaveContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/Card';
import { getEmployees } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiClock, FiAlertCircle, FiUsers, FiCheck, FiX, FiCheckCircle, FiXCircle, FiPaperclip } from 'react-icons/fi';
import './Dashboard.css';

// Mock team data — members supervised by the logged-in manager
const TEAM_MEMBERS = ['EMP-001', 'EMP-005', 'EMP-007', 'EMP-008', 'EMP-011'];

const teamAttendanceData = [
  { day: 'Mon', present: 5, absent: 0 },
  { day: 'Tue', present: 4, absent: 1 },
  { day: 'Wed', present: 5, absent: 0 },
  { day: 'Thu', present: 3, absent: 2 },
  { day: 'Fri', present: 5, absent: 0 },
];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { leaves, updateLeaveStatus, updateDocumentStatus } = useLeaves();
  const { addToast } = useToast();
  const { addNotification } = useNotifications();
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commentModal, setCommentModal] = useState({ open: false, leaveId: null, action: '', comment: '' });
  const [processing, setProcessing] = useState(false);
  const [docModal, setDocModal] = useState({ open: false, leaveId: null, docUrl: null });

  useEffect(() => {
    const fetchData = async () => {
      const empRes = await getEmployees();
      const team = empRes.data.filter((e) => TEAM_MEMBERS.includes(e.id));
      setTeamEmployees(team);
    };
    fetchData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const teamLeaves = leaves.filter((l) => TEAM_MEMBERS.includes(l.employeeId));
  const pendingLeaves = teamLeaves.filter((l) => l.status === 'Pending');
  const teamOnLeave = teamLeaves.filter((l) => l.status === 'Approved' || l.status === 'Taken');
  const approvedToday = teamLeaves.filter((l) => l.status === 'Approved').length;
  const rejectedToday = teamLeaves.filter((l) => l.status === 'Rejected').length;

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const openCommentModal = (leaveId, action) => {
    setCommentModal({ open: true, leaveId, action, comment: '' });
  };

  const handleConfirmAction = async () => {
    const { leaveId, action, comment } = commentModal;
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    const matchedLeave = leaves.find((l) => l.id === leaveId);
    
    setProcessing(true);
    await new Promise(r => setTimeout(r, 600));
    
    await updateLeaveStatus(leaveId, status, comment);
    setProcessing(false);
    setCommentModal({ open: false, leaveId: null, action: '', comment: '' });
    
    // Add notification for the employee
    if (matchedLeave) {
      addNotification(
        matchedLeave.employeeId,
        action === 'approve' ? 'approve' : 'reject',
        `Your ${matchedLeave.leaveType} request was ${action === 'approve' ? 'Approved' : 'Rejected'}`
      );
    }

    addToast(
      action === 'approve'
        ? `Leave Approved Successfully ✅`
        : `Leave Rejected ❌`,
      action === 'approve' ? 'success' : 'error'
    );
  };

  const openDocModal = (leaveId, docUrl) => {
    window.open(docUrl, '_blank');
    setDocModal({ open: true, leaveId, docUrl });
  };

  const handleVerifyDocument = async (action) => {
    try {
      await updateDocumentStatus(docModal.leaveId, action);
      addToast(
        `Document ${action === 'Verified' ? 'Verified ✅' : 'Rejected ❌'}`,
        action === 'Verified' ? 'success' : 'error'
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Document action failed', 'error');
    } finally {
      setDocModal({ open: false, leaveId: null, docUrl: null });
    }
  };

  const recentRequests = teamLeaves
    .filter((l) => l.status !== 'Pending')
    .slice(0, 5);

  const quickLinks = [
    { label: 'Leave List', icon: '📋', path: '/leave/list', color: '#3b82f6' },
    { label: 'Apply Leave', icon: '✈️', path: '/leave/apply', color: '#e8833a' },
    { label: 'Timesheets', icon: '⏱️', path: '/time', color: '#22c55e' },
    { label: 'My Leaves', icon: '📅', path: '/leave/my-leaves', color: '#a855f7' },
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

      <div className="dashboard__stats">
        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{teamEmployees.length}</span>
            <span className="stat-card__label">Team Members</span>
          </div>
        </div>
        <div className="stat-card stat-card--blue" style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon"><FiAlertCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{pendingLeaves.length}</span>
            <span className="stat-card__label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__icon"><FiCheckCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{approvedToday}</span>
            <span className="stat-card__label">Approved</span>
          </div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card__icon"><FiXCircle /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{rejectedToday}</span>
            <span className="stat-card__label">Rejected</span>
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        {/* CRITICAL: Pending Leave Approvals */}
        <Card title={`Pending Leave Approvals (${pendingLeaves.length})`} icon="⏳" className="dashboard__leave-today dashboard__pending-critical">
          <div className="leave-today-list">
            {pendingLeaves.length === 0 ? (
              <p className="leave-today__empty">No pending requests ✨</p>
            ) : (
              pendingLeaves.map((leave) => (
                <div key={leave.id} className="leave-today__item leave-today__item--pending">
                  <div className="leave-today__avatar">
                    {leave.employeeName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="leave-today__info">
                    <span className="leave-today__name">{leave.employeeName}</span>
                    <span className="leave-today__type">{leave.leaveType} · {leave.fromDate} — {leave.toDate} · {leave.duration} day(s)</span>
                    {leave.leaveType === 'Sick Leave' && leave.document && (
                      <button
                        onClick={() => openDocModal(leave.id, leave.document)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'none', border: 'none', color: '#3b82f6',
                          fontSize: '12px', cursor: 'pointer', padding: '2px 0', marginTop: '2px',
                          textDecoration: 'underline',
                        }}
                      >
                        <FiPaperclip size={12} /> View Document
                        {leave.documentStatus && leave.documentStatus !== 'None' && (
                          <span className={`status-badge status-badge--${leave.documentStatus.toLowerCase()}`} style={{ fontSize: '10px', marginLeft: '6px' }}>
                            {leave.documentStatus}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="leave-today__actions" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-approve"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Approve"
                      onClick={() => openCommentModal(leave.id, 'approve')}
                      disabled={processing}
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      className="btn-reject"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Reject"
                      onClick={() => openCommentModal(leave.id, 'reject')}
                      disabled={processing}
                    >
                      <FiX /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Quick Actions" icon="🚀" className="dashboard__quick">
          <div className="quick-links">
            {quickLinks.map((link) => (
              <Link key={link.label} to={link.path} className="quick-link" style={{ '--link-color': link.color }}>
                <span className="quick-link__icon">{link.icon}</span>
                <span className="quick-link__label">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Team On Leave Today" icon="🏖️">
          <div className="leave-today-list">
            {teamOnLeave.length === 0 ? (
              <p className="leave-today__empty">No team members on leave ✨</p>
            ) : (
              teamOnLeave.map((leave) => (
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

        <Card title="Recent Requests" icon="📋">
          <div className="leave-today-list">
            {recentRequests.length === 0 ? (
              <p className="leave-today__empty">No recent requests</p>
            ) : (
              recentRequests.map((leave) => (
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

        <Card title="Team Attendance" icon="📈" className="dashboard__chart-bar dashboard__buzz">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={teamAttendanceData} barGap={4}>
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

      {/* Comment Modal for Approve/Reject */}
      {commentModal.open && (
        <div className="modal-overlay" onClick={() => !processing && setCommentModal({ ...commentModal, open: false })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-card__title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {commentModal.action === 'approve' ? <FiCheck style={{ color: '#22c55e' }} /> : <FiX style={{ color: '#ef4444' }} />}
              {commentModal.action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
            </h3>
            <p className="modal-card__subtitle">
              {commentModal.action === 'approve'
                ? 'Are you sure you want to approve this leave request?'
                : 'Are you sure you want to reject this leave request?'
              }
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Comment {commentModal.action === 'reject' ? '(recommended)' : '(optional)'}
              </label>
              <textarea
                rows={3}
                placeholder="Add a comment for the employee..."
                value={commentModal.comment}
                disabled={processing}
                onChange={(e) => setCommentModal({ ...commentModal, comment: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #e5e7eb', fontSize: '13px', resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn--secondary"
                onClick={() => setCommentModal({ ...commentModal, open: false })}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className={commentModal.action === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={handleConfirmAction}
                disabled={processing}
              >
                {processing ? <span className="spinner--small" /> : (commentModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal — Verify / Reject */}
      {docModal.open && (
        <div className="modal-overlay" onClick={() => setDocModal({ open: false, leaveId: null, docUrl: null })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-card__title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiPaperclip style={{ color: '#3b82f6' }} />
              Verify Document
            </h3>
            <p className="modal-card__subtitle">
              The document has been opened in a new tab. Please review it and take action below.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn--secondary"
                onClick={() => setDocModal({ open: false, leaveId: null, docUrl: null })}
              >
                Close
              </button>
              <button
                className="btn-reject"
                onClick={() => handleVerifyDocument('Rejected')}
              >
                <FiX /> Reject Doc
              </button>
              <button
                className="btn-approve"
                onClick={() => handleVerifyDocument('Verified')}
              >
                <FiCheck /> Verify Doc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
