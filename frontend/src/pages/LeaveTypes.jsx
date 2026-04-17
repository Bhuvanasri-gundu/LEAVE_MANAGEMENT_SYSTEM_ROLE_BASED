import { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { getLeaveTypes, addLeaveType } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import './Pages.css';

export default function LeaveTypes() {
  const { addToast } = useToast();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', daysPerYear: '', situational: false });
  const [formError, setFormError] = useState('');

  const fetchLeaveTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLeaveTypes();
      const data = res.data?.data ?? res.data ?? [];
      setTypes(Array.isArray(data) ? data.map((t) => ({ ...t, id: t.id || t._id })) : []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load leave types', 'error');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  const handleAddClick = () => {
    setForm({ name: '', daysPerYear: '', situational: false });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Leave type name is required');
      return;
    }

    if (!form.daysPerYear || isNaN(form.daysPerYear) || parseInt(form.daysPerYear) < 0) {
      setFormError('Days per year must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await addLeaveType({
        name: form.name.trim(),
        daysPerYear: parseInt(form.daysPerYear),
        situational: form.situational,
      });
      addToast('✅ Leave type added successfully!', 'success');
      setShowModal(false);
      setForm({ name: '', daysPerYear: '', situational: false });
      await fetchLeaveTypes();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add leave type';
      setFormError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this leave type?')) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      addToast('Leave type deleted', 'warning');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Leave Type' },
    { key: 'daysPerYear', label: 'Days/Year' },
    {
      key: 'situational', label: 'Situational',
      render: (val) => val ? <span className="status-badge status-badge--pending">Yes</span> : <span className="status-badge status-badge--approved">No</span>
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Leave Types</h2>
        <button className="btn btn--primary" onClick={handleAddClick} disabled={submitting}>
          <FiPlus /> Add Leave Type
        </button>
      </div>

      <Card title="Configured Leave Types" icon="📂">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={types}
            emptyMessage="No leave types configured"
            actions={(row) => (
              <>
                <button className="btn-action btn-action--edit" title="Edit"><FiEdit2 /></button>
                <button className="btn-action btn-action--delete" title="Delete" onClick={() => handleDelete(row.id)}><FiTrash2 /></button>
              </>
            )}
          />
        )}
      </Card>

      {/* Add Leave Type Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Add New Leave Type</h3>
              <button className="modal__close" onClick={handleCloseModal} disabled={submitting}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                {formError && (
                  <div className="page__alert page__alert--error" style={{ marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Leave Type Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sabbatical Leave"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e8833a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Days Per Year *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    min="0"
                    value={form.daysPerYear}
                    onChange={(e) => setForm({ ...form, daysPerYear: e.target.value })}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e8833a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.situational}
                      onChange={(e) => setForm({ ...form, situational: e.target.checked })}
                      disabled={submitting}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Situational Leave (discretionary)
                  </label>
                </div>
              </div>
              <div className="modal__footer">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting}
                >
                  {submitting ? <> <span className="spinner--small" /> Adding...</> : <><FiPlus /> Add Leave Type</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
