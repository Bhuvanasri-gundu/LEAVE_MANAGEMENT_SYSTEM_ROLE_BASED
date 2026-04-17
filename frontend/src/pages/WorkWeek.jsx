import { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { FiSave } from 'react-icons/fi';
import './Pages.css';

const defaultWorkWeek = [
  { day: 'Monday', status: 'Full Day' },
  { day: 'Tuesday', status: 'Full Day' },
  { day: 'Wednesday', status: 'Full Day' },
  { day: 'Thursday', status: 'Full Day' },
  { day: 'Friday', status: 'Full Day' },
  { day: 'Saturday', status: 'Non-working Day' },
  { day: 'Sunday', status: 'Non-working Day' },
];

const dayOptions = ['Full Day', 'Half Day', 'Non-working Day'];

export default function WorkWeek() {
  const { user } = useAuth();
  const [workWeek, setWorkWeek] = useState(defaultWorkWeek);
  const [saved, setSaved] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const handleChange = (idx, status) => {
    setWorkWeek((prev) => prev.map((d, i) => i === idx ? { ...d, status } : d));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getStatusColor = (status) => {
    if (status === 'Full Day') return '#22c55e';
    if (status === 'Half Day') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Work Week</h2>
      </div>

      {saved && <div className="page__alert page__alert--success">✅ Work week saved successfully!</div>}

      <Card title={isAdmin ? 'Configure Work Week' : 'Work Week Schedule'} icon="📅">
        <div className="work-week-grid">
          {workWeek.map((item, idx) => (
            <div key={item.day} className="work-week-row">
              <div className="work-week-row__day">
                <span className="work-week-row__dot" style={{ background: getStatusColor(item.status) }} />
                <span className="work-week-row__name">{item.day}</span>
              </div>
              {isAdmin ? (
                <select
                  className="form-select work-week-row__select"
                  value={item.status}
                  onChange={(e) => handleChange(idx, e.target.value)}
                >
                  {dayOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <span className={`status-badge status-badge--${item.status === 'Full Day' ? 'approved' : item.status === 'Half Day' ? 'pending' : 'rejected'}`}>
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="form-actions" style={{ marginTop: 20 }}>
            <button className="btn btn--primary" onClick={handleSave}><FiSave /> Save</button>
          </div>
        )}
      </Card>
    </div>
  );
}
