import { useState } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { TextInput, SelectInput, DateInput } from '../components/FormInputs';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { useToast } from '../context/ToastContext';
import { FiCheck, FiX, FiRefreshCw, FiSearch, FiMessageSquare, FiPaperclip } from 'react-icons/fi';
import './Pages.css';

// Team members supervised by the manager (Sarah Johnson)
const MANAGER_TEAM = ['EMP-001', 'EMP-005', 'EMP-007', 'EMP-008', 'EMP-011'];

const statusOptions = ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Taken', 'Scheduled'];

export default function LeaveList() {
  const { user } = useAuth();
  const { leaves, loading, updateLeaveStatus, updateDocumentStatus } = useLeaves();
  const { addToast } = useToast();
  const [filters, setFilters] = useState({
    fromDate: '', toDate: '', status: '', empName: ''
  });
  const [commentModal, setCommentModal] = useState({ open: false, leaveId: null, action: '', comment: '' });
  const [docModal, setDocModal] = useState({ open: false, leaveId: null, docUrl: null });
  const [processing, setProcessing] = useState(false);

  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';
  const canApprove = isManager || isAdmin;

  // Filter leaves based on role
  let visibleLeaves = [...leaves];
  if (isManager) {
    visibleLeaves = visibleLeaves.filter((l) => MANAGER_TEAM.includes(l.employeeId));
  }

  // Apply user filters
  let filtered = [...visibleLeaves];
  if (filters.empName) filtered = filtered.filter((l) =>
    l.employeeName.toLowerCase().includes(filters.empName.toLowerCase())
  );
  if (filters.status) filtered = filtered.filter((l) => l.status === filters.status);
  if (filters.fromDate) filtered = filtered.filter((l) => l.fromDate >= filters.fromDate);
  if (filters.toDate) filtered = filtered.filter((l) => l.toDate <= filters.toDate);

  const handleReset = () => {
    setFilters({ fromDate: '', toDate: '', status: '', empName: '' });
  };

  const handleFilter = () => {
    setFilters({ ...filters });
  };

  const openCommentModal = (leaveId, action) => {
    setCommentModal({ open: true, leaveId, action, comment: '' });
  };

  const handleConfirmAction = async () => {
    const { leaveId, action, comment } = commentModal;
    const status = action === 'approve' ? 'Approved' : 'Rejected';

    setProcessing(true);
    try {
      await updateLeaveStatus(leaveId, status, comment);
      setCommentModal({ open: false, leaveId: null, action: '', comment: '' });
      addToast(
        action === 'approve' ? 'Leave Approved Successfully ✅' : 'Leave Rejected ❌',
        action === 'approve' ? 'success' : 'error'
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyDocument = async (leaveId, action) => {
    try {
      await updateDocumentStatus(leaveId, action);
      setDocModal({ open: false, leaveId: null, docUrl: null });
      addToast(
        `Document ${action === 'Verified' ? 'Verified ✅' : 'Rejected ❌'}`,
        action === 'Verified' ? 'success' : 'error'
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Document action failed', 'error');
    }
  };

  const openDocModal = (leaveId, docUrl) => {
    window.open(docUrl, '_blank');
    setDocModal({ open: true, leaveId, docUrl });
  };

  // Stats
  const pendingCount = visibleLeaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = visibleLeaves.filter((l) => l.status === 'Approved' || l.status === 'Taken').length;
  const rejectedCount = visibleLeaves.filter((l) => l.status === 'Rejected').length;

  const columns = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'fromDate', label: 'From' },
    { key: 'toDate', label: 'To' },
    { key: 'duration', label: 'Days', render: (val) => `${val} day(s)` },
    {
      key: 'status', label: 'Status',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className={`status-badge status-badge--${val.toLowerCase().replace(' ', '-')}`}>{val}</span>
          {row.documentStatus && row.documentStatus !== 'None' && (
            <span className={`status-badge status-badge--${row.documentStatus.toLowerCase()}`} style={{ fontSize: '10px' }}>
              Doc: {row.documentStatus}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'document', label: 'Document',
      render: (doc, row) => {
        // Only show View button for Sick Leave with document
        if (row.leaveType === 'Sick Leave' && doc) {
          return (
            <button 
              className="btn-action btn-action--view" 
              title="View Document" 
              onClick={() => openDocModal(row.id, doc)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <FiPaperclip /> View
            </button>
          );
        }
        // For all other cases, show "None"
        return <span style={{ color: '#9ca3af', fontSize: '12px' }}>None</span>;
      }
    },
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

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Leave List{isManager ? ' (My Team)' : ''}</h2>
      </div>

      {/* Summary stats */}
      <div className="leave-stats-row leave-stats-row--compact">
        <div className="leave-stat-card leave-stat-card--total">
          <span className="leave-stat-card__value">{visibleLeaves.length}</span>
          <span className="leave-stat-card__label">Total</span>
        </div>
        <div className="leave-stat-card leave-stat-card--pending">
          <span className="leave-stat-card__value">{pendingCount}</span>
          <span className="leave-stat-card__label">Pending</span>
        </div>
        <div className="leave-stat-card leave-stat-card--approved">
          <span className="leave-stat-card__value">{approvedCount}</span>
          <span className="leave-stat-card__label">Approved</span>
        </div>
        <div className="leave-stat-card leave-stat-card--rejected">
          <span className="leave-stat-card__value">{rejectedCount}</span>
          <span className="leave-stat-card__label">Rejected</span>
        </div>
      </div>

      <Card title="Filters" icon="🔍" className="page__filters">
        <div className="filter-grid">
          <DateInput label="From Date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} id="leave-from" />
          <DateInput label="To Date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} id="leave-to" />
          <SelectInput label="Show Leave with Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={statusOptions} placeholder="-- All --" id="leave-status" />
          <TextInput label="Employee Name" value={filters.empName} onChange={(e) => setFilters({ ...filters, empName: e.target.value })} placeholder="Type for hints..." id="leave-emp" />
        </div>
        <div className="filter-actions">
          <button className="btn btn--secondary" onClick={handleReset}><FiRefreshCw /> Reset</button>
          <button className="btn btn--primary" onClick={handleFilter}><FiSearch /> Search</button>
        </div>
      </Card>

      <Card title={`Records Found (${filtered.length})`} icon="📋">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            emptyMessage="No leave records found"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {canApprove && row.status === 'Pending' && (
                  <>
                    <button
                      className="btn-approve"
                      title="Approve"
                      onClick={() => openCommentModal(row.id, 'approve')}
                      disabled={processing}
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      className="btn-reject"
                      title="Reject"
                      onClick={() => openCommentModal(row.id, 'reject')}
                      disabled={processing}
                    >
                      <FiX /> Reject
                    </button>
                  </>
                )}
              </div>
            )}
          />
        )}
      </Card>

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
                className="form-textarea"
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

      {/* Document Verification Modal */}
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
                onClick={() => handleVerifyDocument(docModal.leaveId, 'Rejected')}
              >
                <FiX /> Reject
              </button>
              <button
                className="btn-approve"
                onClick={() => handleVerifyDocument(docModal.leaveId, 'Verified')}
              >
                <FiCheck /> Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}