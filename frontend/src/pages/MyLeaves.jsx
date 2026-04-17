import Card from '../components/Card';
import Table from '../components/Table';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { useToast } from '../context/ToastContext';
import { FiXCircle, FiMessageSquare } from 'react-icons/fi';
import './Pages.css';

export default function MyLeaves() {
  const { user } = useAuth();
  const { leaves, loading, cancelLeave } = useLeaves();
  const { addToast } = useToast();

  const myLeaves = leaves.filter((l) => l.employeeId === user.id);

  // Normalize today's date (YYYY-MM-DD) for proper date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Separate into upcoming and history based on toDate
  // Upcoming: toDate >= today (with appropriate status checks)
  // History: toDate < today (OR specific terminal statuses)
  const upcomingLeaves = myLeaves.filter((l) => {
    const toDate = new Date(l.toDate);
    toDate.setHours(0, 0, 0, 0);
    return toDate >= today && (l.status === 'Pending' || l.status === 'Approved' || l.status === 'Scheduled');
  });

  const leaveHistory = myLeaves.filter((l) => {
    const toDate = new Date(l.toDate);
    toDate.setHours(0, 0, 0, 0);
    return toDate < today || l.status === 'Taken' || l.status === 'Rejected' || l.status === 'Cancelled';
  });

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this leave request?')) {
      try {
        await cancelLeave(id);
        addToast('Leave Cancelled', 'warning');
      } catch (err) {
        addToast(err.response?.data?.message || 'Could not cancel leave', 'error');
      }
    }
  };

  const columns = [
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'fromDate', label: 'From' },
    { key: 'toDate', label: 'To' },
    { key: 'duration', label: 'Days', render: (val) => `${val} day(s)` },
    {
      key: 'status', label: 'Status',
      render: (val) => <span className={`status-badge status-badge--${val.toLowerCase()}`}>{val}</span>
    },
    { key: 'comments', label: 'Comments' },
    {
      key: 'managerComment', label: 'Manager Comment',
      render: (val) => val ? (
        <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
          <FiMessageSquare style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {val}
        </span>
      ) : <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>
    },
  ];

  const leaveStats = {
    total: myLeaves.length,
    pending: myLeaves.filter((l) => l.status === 'Pending').length,
    approved: myLeaves.filter((l) => l.status === 'Approved' || l.status === 'Taken').length,
    rejected: myLeaves.filter((l) => l.status === 'Rejected').length,
  };

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">My Leave</h2>
      </div>

      <div className="leave-stats-row">
        <div className="leave-stat-card leave-stat-card--total">
          <span className="leave-stat-card__value">{leaveStats.total}</span>
          <span className="leave-stat-card__label">Total</span>
        </div>
        <div className="leave-stat-card leave-stat-card--pending">
          <span className="leave-stat-card__value">{leaveStats.pending}</span>
          <span className="leave-stat-card__label">Pending</span>
        </div>
        <div className="leave-stat-card leave-stat-card--approved">
          <span className="leave-stat-card__value">{leaveStats.approved}</span>
          <span className="leave-stat-card__label">Approved</span>
        </div>
        <div className="leave-stat-card leave-stat-card--rejected">
          <span className="leave-stat-card__value">{leaveStats.rejected}</span>
          <span className="leave-stat-card__label">Rejected</span>
        </div>
      </div>

      {/* Upcoming Leaves */}
      <Card title={`Upcoming Leaves (${upcomingLeaves.length})`} icon="📅" className="mb-20">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={upcomingLeaves}
            emptyMessage="No upcoming leaves"
            actions={(row) => (
              <>
                {row.status === 'Pending' && (
                  <button className="btn-action btn-action--delete" title="Cancel Leave" onClick={() => handleCancel(row.id)}>
                    <FiXCircle />
                  </button>
                )}
              </>
            )}
          />
        )}
      </Card>

      {/* Leave History */}
      <Card title={`Leave History (${leaveHistory.length})`} icon="📋">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={leaveHistory}
            emptyMessage="No leave history"
            actions={(row) => (
              <>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
