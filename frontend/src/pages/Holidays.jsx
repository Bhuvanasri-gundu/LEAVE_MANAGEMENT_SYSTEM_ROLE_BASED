import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { getHolidays, addHoliday } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import './Pages.css';

export default function Holidays() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', length: 'Full Day', recurring: false });
  const [formError, setFormError] = useState('');

  const isAdmin = user?.role === 'Admin';

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await getHolidays();
      const data = res.data?.data ?? res.data ?? [];
      setHolidays(Array.isArray(data) ? data.map((h) => ({ ...h, id: h.id || h._id })) : []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load holidays', 'error');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddClick = () => {
    setForm({ name: '', date: '', length: 'Full Day', recurring: false });
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
      setFormError('Holiday name is required');
      return;
    }

    if (!form.date) {
      setFormError('Date is required');
      return;
    }

    setSubmitting(true);
    try {
      await addHoliday({
        name: form.name.trim(),
        date: form.date,
        length: form.length,
        recurring: form.recurring,
      });
      addToast('✅ Holiday added successfully!', 'success');
      setShowModal(false);
      setForm({ name: '', date: '', length: 'Full Day', recurring: false });
      await fetchHolidays();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add holiday';
      setFormError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this holiday?')) {
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      addToast('Holiday deleted', 'warning');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Holiday Name' },
    { key: 'date', label: 'Date' },
    { key: 'length', label: 'Length' },
    {
      key: 'recurring', label: 'Recurring',
      render: (val) => val ? <span className="status-badge status-badge--approved">Yes</span> : <span className="status-badge status-badge--not-started">No</span>
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Holidays</h2>
        {isAdmin && (
          <button className="btn btn--primary" onClick={handleAddClick} disabled={submitting}>
            <FiPlus /> Add Holiday
          </button>
        )}
      </div>

      <Card title={`Holidays (${holidays.length})`} icon="🎉">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={holidays}
            emptyMessage="No holidays configured"
            actions={isAdmin ? (row) => (
              <>
                <button className="btn-action btn-action--edit" title="Edit"><FiEdit2 /></button>
                <button className="btn-action btn-action--delete" title="Delete" onClick={() => handleDelete(row.id)}><FiTrash2 /></button>
              </>
            ) : undefined}
          />
        )}
      </Card>

      {/* Add Holiday Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Add New Holiday</h3>
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
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Christmas Day"
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
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e8833a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e8833a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Length *
                  </label>
                  <select
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: e.target.value })}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e8833a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Multiple Days">Multiple Days</option>
                  </select>
                </div>
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.recurring}
                      onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                      disabled={submitting}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Recurring Holiday (every year)
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
                  {submitting ? <> <span className="spinner--small" /> Adding...</> : <><FiPlus /> Add Holiday</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
