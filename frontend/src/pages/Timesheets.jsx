import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { TextInput } from '../components/FormInputs';
import { getTimesheets, getTimesheetsByEmployee } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiSearch, FiClock } from 'react-icons/fi';
import './Pages.css';

export default function Timesheets() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await getTimesheets();
      // Employees only see their own timesheets
      if (user.role === 'Employee') {
        const mySheets = res.data.filter((t) => t.employeeId === user.id);
        setTimesheets(mySheets);
        setFiltered(mySheets);
      } else {
        setTimesheets(res.data);
        setFiltered(res.data);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSearch = async () => {
    if (!searchName.trim()) {
      setFiltered(timesheets);
      return;
    }
    const res = await getTimesheetsByEmployee(searchName);
    setFiltered(res.data);
  };

  const pendingTimesheets = filtered.filter((t) => t.status === 'Submitted' || t.status === 'Pending');

  const columns = [
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'period', label: 'Timesheet Period' },
    { key: 'totalHours', label: 'Total Hours', render: (val) => `${val}h` },
    {
      key: 'status', label: 'Status',
      render: (val) => <span className={`status-badge status-badge--${val.toLowerCase()}`}>{val}</span>
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Timesheets</h2>
      </div>

      {user.role !== 'Employee' && (
        <Card title="Search Timesheets" icon="🔍">
          <div className="timesheet-search">
            <TextInput
              label="Employee Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Type employee name..."
              id="ts-search"
            />
            <button className="btn btn--primary" onClick={handleSearch} style={{ marginTop: 24 }}>
              <FiSearch /> View
            </button>
          </div>
        </Card>
      )}

      {user.role !== 'Employee' && pendingTimesheets.length > 0 && (
        <Card title="Timesheets Pending Action" icon="⏳" className="mb-20">
          <Table
            columns={columns}
            data={pendingTimesheets}
            emptyMessage="No pending timesheets"
            actions={(row) => (
              <button className="btn-action btn-action--view" title="View" onClick={() => setSelectedTimesheet(row)}>
                <FiEye />
              </button>
            )}
          />
        </Card>
      )}

      <Card title={`All Timesheets (${filtered.length})`} icon="📋">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            emptyMessage="No timesheets found"
            actions={(row) => (
              <button className="btn-action btn-action--view" title="View" onClick={() => setSelectedTimesheet(row)}>
                <FiEye />
              </button>
            )}
          />
        )}
      </Card>

      {selectedTimesheet && (
        <div className="modal-overlay" onClick={() => setSelectedTimesheet(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{selectedTimesheet.employeeName} — Timesheet Details</h3>
              <button className="modal__close" onClick={() => setSelectedTimesheet(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="timesheet-detail">
                <p><strong>Period:</strong> {selectedTimesheet.period}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-badge--${selectedTimesheet.status.toLowerCase()}`}>{selectedTimesheet.status}</span></p>
                <p><strong>Total Hours:</strong> {selectedTimesheet.totalHours}h</p>
              </div>
              <table className="data-table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Project</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTimesheet.entries?.map((entry, idx) => (
                    <tr key={idx} className="table-row">
                      <td>{entry.day}</td>
                      <td>{entry.project}</td>
                      <td>{entry.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal__footer">
              {selectedTimesheet.status === 'Submitted' && user.role !== 'Employee' && (
                <button className="btn btn--primary" onClick={() => {
                  setFiltered((prev) => prev.map((t) => t.id === selectedTimesheet.id ? { ...t, status: 'Approved' } : t));
                  setSelectedTimesheet(null);
                }}>Approve</button>
              )}
              <button className="btn btn--secondary" onClick={() => setSelectedTimesheet(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
