import { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { TextInput, SelectInput, DateInput, TextArea } from '../components/FormInputs';
import { getLeaveTypes, getEmployees, applyLeave } from '../services/api';
import { useLeaves } from '../context/LeaveContext';
import { useToast } from '../context/ToastContext';
import { FiSend, FiX, FiAlertTriangle } from 'react-icons/fi';
import './Pages.css';

export default function AssignLeave() {
  const { leaves, addLeave } = useLeaves();
  const { addToast } = useToast();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeName: '', leaveType: '', fromDate: '', toDate: '', partialDays: 'None', comments: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        const [typesRes, empRes] = await Promise.all([getLeaveTypes(), getEmployees()]);
        setLeaveTypes(typesRes.data?.data || typesRes.data || []);
        setEmployees(empRes.data?.data || empRes.data || []);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load data';
        setError(msg);
        addToast(msg, 'error');
        setLeaveTypes([]);
        setEmployees([]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [addToast]);

  const calculateDuration = () => {
    if (!form.fromDate || !form.toDate) return '0.00';
    const diff = Math.ceil((new Date(form.toDate) - new Date(form.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff.toFixed(2) : '0.00';
  };

  const selectedEmployee = useMemo(() => {
    return employees.find((emp) => `${emp.firstName} ${emp.lastName}` === form.employeeName);
  }, [employees, form.employeeName]);

  const checkConflict = useMemo(() => {
    if (!form.fromDate || !form.toDate || !selectedEmployee) return false;
    const fStart = new Date(form.fromDate);
    const fEnd = new Date(form.toDate);
    
    // Check if anyone else has overlapping leave
    return leaves.some((l) => {
      if (l.employeeId === selectedEmployee.id || l.status === 'Rejected' || l.status === 'Cancelled') return false;
      const lStart = new Date(l.fromDate);
      const lEnd = new Date(l.toDate);
      return fStart <= lEnd && fEnd >= lStart;
    });
  }, [form.fromDate, form.toDate, leaves, selectedEmployee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeName || !form.leaveType || !form.fromDate || !form.toDate) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        employeeId: selectedEmployee?.id || 'unknown',
        employeeName: form.employeeName,
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        duration: calculateDuration(),
        comments: form.comments,
        appliedDate: new Date().toISOString().split('T')[0],
        document: null,
        documentStatus: 'None',
      };
      
      const res = await applyLeave(payload);
      addLeave(res.data?.data || res.data);
      addToast('✅ Leave assigned successfully!', 'success');
      setForm({ employeeName: '', leaveType: '', fromDate: '', toDate: '', partialDays: 'None', comments: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign leave';
      addToast(msg, 'error');
      console.error('Assign leave error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="page">
        <div className="page__header">
          <h2 className="page__title">Assign Leave</h2>
        </div>
        <Card title="Assign Leave to Employee" icon="📅">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner spinner--large" style={{ margin: '0 auto 20px' }} />
            <p>Loading employees and leave types...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Assign Leave</h2>
      </div>

      {error && (
        <div className="page__alert page__alert--error" style={{ marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="page__alert page__alert--success">
          ✅ Leave assigned successfully!
        </div>
      )}

      <Card title="Assign Leave to Employee" icon="📅">
        <form onSubmit={handleSubmit}>
          <div className="form-row form-row--2">
            <SelectInput
              label="Employee Name"
              value={form.employeeName}
              onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              options={employees.map((emp) => ({ value: `${emp.firstName} ${emp.lastName}`, label: `${emp.firstName} ${emp.lastName}` }))}
              required
              id="assign-emp"
            />
            <SelectInput
              label="Leave Type"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              options={leaveTypes.map((t) => ({ value: t.name, label: t.name }))}
              required
              id="assign-type"
            />
          </div>
          <div className="form-row form-row--2">
            <DateInput label="From Date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required id="assign-from" />
            <DateInput label="To Date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required id="assign-to" />
          </div>

          {checkConflict && (
            <div className="page__alert page__alert--warning mb-20" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <FiAlertTriangle /> 
              <span>Warning: Multiple users have requested leave during these overlapping dates.</span>
            </div>
          )}

          <div className="form-row form-row--2" style={{ marginTop: '16px' }}>
            <SelectInput
              label="Partial Days"
              value={form.partialDays}
              onChange={(e) => setForm({ ...form, partialDays: e.target.value })}
              options={['None', 'All Days', 'Start Day Only', 'End Day Only']}
              id="assign-partial"
            />
            <div className="duration-display duration-display--inline">
              <span className="duration-label">Duration:</span>
              <span className="duration-value">{calculateDuration()} day(s)</span>
            </div>
          </div>
          <div className="form-row">
            <TextArea label="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} placeholder="Reason for leave assignment..." id="assign-comment" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => setForm({ employeeName: '', leaveType: '', fromDate: '', toDate: '', partialDays: 'None', comments: '' })}>
              <FiX /> Reset
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting || !selectedEmployee}>
              {submitting ? <span className="spinner spinner--small" /> : <><FiSend /> Assign</>}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
