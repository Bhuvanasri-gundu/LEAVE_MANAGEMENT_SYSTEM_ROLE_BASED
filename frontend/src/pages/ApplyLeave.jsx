import { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { SelectInput, DateInput, TextArea } from '../components/FormInputs';
import { getLeaveTypes, applyLeave as apiApplyLeave, checkConflict } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { useToast } from '../context/ToastContext';
import { FiSend, FiX, FiUploadCloud, FiAlertTriangle } from 'react-icons/fi';
import './Pages.css';

export default function ApplyLeave() {
  const { user } = useAuth();
  const { addLeave } = useLeaves();
  const { addToast } = useToast();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    leaveType: '', fromDate: '', toDate: '', comments: '', partialDays: 'None'
  });
  const [document, setDocument] = useState(null);
  const [docError, setDocError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    getLeaveTypes()
      .then((res) => {
        const types = res.data?.data ?? res.data ?? [];
        setLeaveTypes(Array.isArray(types) ? types : []);
      })
      .catch(() => setLeaveTypes([]));
  }, []);

  const calculateDuration = () => {
    if (!form.fromDate || !form.toDate) return '0.00';
    const from = new Date(form.fromDate);
    const to = new Date(form.toDate);
    const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff.toFixed(2) : '0.00';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDocError('');
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setDocError('File size must be less than 2MB');
        setDocument(null);
      } else {
        setDocument(file);
      }
    }
  };

  // Real conflict check via API whenever dates change
  const runConflictCheck = useCallback(async () => {
    if (!form.fromDate || !form.toDate) { setConflict(false); return; }
    try {
      const res = await checkConflict(form.fromDate, form.toDate);
      setConflict(res.data?.conflict ?? false);
    } catch { setConflict(false); }
  }, [form.fromDate, form.toDate]);

  useEffect(() => { runConflictCheck(); }, [runConflictCheck]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!form.leaveType || !form.fromDate || !form.toDate) return;
    if (docError) return;

    // Require document only for Sick Leave
    if (form.leaveType === 'Sick Leave' && !document) {
      setDocError('Document upload is required for Sick leave.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('leaveType', form.leaveType);
      formData.append('fromDate', form.fromDate);
      formData.append('toDate', form.toDate);
      formData.append('duration', calculateDuration());
      formData.append('comments', form.comments || '');
      if (document) formData.append('document', document);

      const res = await apiApplyLeave(formData);
      const created = res.data?.data ?? res.data;
      addLeave({ ...created, id: created._id ?? created.id });

      addToast(
        user.role === 'Admin' ? 'Leave auto-approved! ✅' : 'Leave Applied Successfully ✅',
        'success'
      );
      setForm({ leaveType: '', fromDate: '', toDate: '', comments: '', partialDays: 'None' });
      setDocument(null);
      setConflict(false);
      setSubmitError('');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ leaveType: '', fromDate: '', toDate: '', comments: '', partialDays: 'None' });
    setDocument(null);
    setDocError('');
    setSubmitError('');
  };

  const entitlementData = [
    { type: 'Annual Leave', entitled: 20, used: 5, scheduled: 0, pending: 5, balance: 10 },
    { type: 'Sick Leave', entitled: 12, used: 2, scheduled: 0, pending: 0, balance: 10 },
    { type: 'Personal Leave', entitled: 5, used: 1, scheduled: 0, pending: 0, balance: 4 },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Apply Leave</h2>
      </div>

      <Card title="Leave Balance" icon="📊" className="mb-20">
        <div className="entitlement-grid">
          {entitlementData.map((item) => (
            <div key={item.type} className="entitlement-card">
              <h4 className="entitlement-card__type">{item.type}</h4>
              <div className="entitlement-card__stats">
                <div className="entitlement-stat">
                  <span className="entitlement-stat__value">{item.entitled}</span>
                  <span className="entitlement-stat__label">Entitled</span>
                </div>
                <div className="entitlement-stat">
                  <span className="entitlement-stat__value entitlement-stat__value--used">{item.used}</span>
                  <span className="entitlement-stat__label">Used</span>
                </div>
                <div className="entitlement-stat">
                  <span className="entitlement-stat__value entitlement-stat__value--pending">{item.pending}</span>
                  <span className="entitlement-stat__label">Pending</span>
                </div>
                <div className="entitlement-stat">
                  <span className="entitlement-stat__value entitlement-stat__value--balance">{Math.max(0, item.balance)}</span>
                  <span className="entitlement-stat__label">Balance</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Leave Details" icon="📝">
        <form onSubmit={handleSubmit}>
          <div className="form-row form-row--2">
            <SelectInput
              label="Leave Type"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              options={leaveTypes.map((t) => ({ value: t.name, label: t.name }))}
              required
              id="apply-type"
            />
            <SelectInput
              label="Partial Days"
              value={form.partialDays}
              onChange={(e) => setForm({ ...form, partialDays: e.target.value })}
              options={['None', 'All Days', 'Start Day Only', 'End Day Only', 'Start and End Day']}
              id="apply-partial"
            />
          </div>
          <div className="form-row form-row--2">
            <DateInput label="From Date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required id="apply-from" />
            <DateInput label="To Date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required id="apply-to" />
          </div>

          {conflict && (
            <div className="page__alert page__alert--warning mb-20" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAlertTriangle />
              <span>Warning: Multiple users have requested leave during these overlapping dates.</span>
            </div>
          )}

          <div className="duration-display">
            <span className="duration-label">Duration:</span>
            <span className="duration-value">{calculateDuration()} day(s)</span>
          </div>

          {form.leaveType === 'Sick Leave' && (
            <div className="form-row" style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Medical Document <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div 
                style={{ 
                  border: '1px dashed #d1d5db', borderRadius: '8px', padding: '16px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  background: '#f9fafb'
                }}>
                <FiUploadCloud size={20} color="#6b7280" />
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ fontSize: '13px' }}
                />
              </div>
              {docError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{docError}</div>}
              {document && !docError && <div style={{ color: '#22c55e', fontSize: '12px', marginTop: '6px' }}>Attached: {document.name}</div>}
              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>Formats: PDF, JPG, PNG (Max: 2MB)</div>
            </div>
          )}

          <div className="form-row">
            <TextArea label="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} placeholder="Optional comments..." id="apply-comment" />
          </div>
          
          {submitError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '16px', color: '#7f1d1d', fontSize: '13px'
            }}>
              {submitError}
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={handleReset}><FiX /> Reset</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? <span className="spinner spinner--small" /> : <><FiSend /> Apply</>}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
