import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { TextInput, SelectInput, DateInput } from '../components/FormInputs';
import { getPerformanceReviews } from '../services/api';
import { FiEye, FiRefreshCw, FiSearch } from 'react-icons/fi';
import './Pages.css';

const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Overdue'];
const includeOptions = ['Current Employees Only', 'Past Employees Only', 'Current and Past Employees'];

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filters, setFilters] = useState({
    empName: '', jobTitle: '', subUnit: '', status: '', fromDate: '', toDate: '', include: ''
  });

  useEffect(() => {
    const fetch = async () => {
      const res = await getPerformanceReviews();
      setReviews(res.data);
      setFiltered(res.data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleFilter = () => {
    let result = [...reviews];
    if (filters.empName) result = result.filter((r) =>
      r.employee.toLowerCase().includes(filters.empName.toLowerCase())
    );
    if (filters.jobTitle) result = result.filter((r) =>
      r.jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase())
    );
    if (filters.subUnit) result = result.filter((r) =>
      r.subUnit.toLowerCase().includes(filters.subUnit.toLowerCase())
    );
    if (filters.status) result = result.filter((r) => r.status === filters.status);
    if (filters.fromDate) result = result.filter((r) => r.dueDate >= filters.fromDate);
    if (filters.toDate) result = result.filter((r) => r.dueDate <= filters.toDate);
    setFiltered(result);
  };

  const handleReset = () => {
    setFilters({ empName: '', jobTitle: '', subUnit: '', status: '', fromDate: '', toDate: '', include: '' });
    setFiltered(reviews);
  };

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'subUnit', label: 'Sub Unit' },
    { key: 'reviewPeriod', label: 'Review Period' },
    { key: 'dueDate', label: 'Due Date' },
    {
      key: 'status', label: 'Status',
      render: (val) => <span className={`status-badge status-badge--${val.toLowerCase().replace(' ', '-')}`}>{val}</span>
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Employee Reviews</h2>
      </div>

      <Card title="Filters" icon="🔍" className="page__filters">
        <div className="filter-grid">
          <TextInput label="Employee Name" value={filters.empName} onChange={(e) => setFilters({ ...filters, empName: e.target.value })} placeholder="Search name" id="perf-emp" />
          <TextInput label="Job Title" value={filters.jobTitle} onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })} placeholder="Job title" id="perf-title" />
          <TextInput label="Sub Unit" value={filters.subUnit} onChange={(e) => setFilters({ ...filters, subUnit: e.target.value })} placeholder="Department" id="perf-unit" />
          <SelectInput label="Review Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={statusOptions} placeholder="-- All --" id="perf-status" />
          <DateInput label="From Date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} id="perf-from" />
          <DateInput label="To Date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} id="perf-to" />
          <SelectInput label="Include" value={filters.include} onChange={(e) => setFilters({ ...filters, include: e.target.value })} options={includeOptions} placeholder="-- Select --" id="perf-include" />
        </div>
        <div className="filter-actions">
          <button className="btn btn--secondary" onClick={handleReset}><FiRefreshCw /> Reset</button>
          <button className="btn btn--primary" onClick={handleFilter}><FiSearch /> Search</button>
        </div>
      </Card>

      <Card title={`Reviews (${filtered.length})`} icon="⭐">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            emptyMessage="No performance reviews found"
            actions={(row) => (
              <button className="btn-action btn-action--view" title="View" onClick={() => setSelectedReview(row)}>
                <FiEye />
              </button>
            )}
          />
        )}
      </Card>

      {selectedReview && (
        <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Performance Review — {selectedReview.employee}</h3>
              <button className="modal__close" onClick={() => setSelectedReview(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="review-detail-grid">
                <div><strong>Job Title:</strong> {selectedReview.jobTitle}</div>
                <div><strong>Sub Unit:</strong> {selectedReview.subUnit}</div>
                <div><strong>Review Period:</strong> {selectedReview.reviewPeriod}</div>
                <div><strong>Due Date:</strong> {selectedReview.dueDate}</div>
                <div><strong>Reviewer:</strong> {selectedReview.reviewer}</div>
                <div><strong>Status:</strong> <span className={`status-badge status-badge--${selectedReview.status.toLowerCase().replace(' ', '-')}`}>{selectedReview.status}</span></div>
                {selectedReview.rating && <div><strong>Rating:</strong> ⭐ {selectedReview.rating}/5</div>}
              </div>
              {selectedReview.goals && (
                <div className="review-goals">
                  <h4>Goals & Objectives</h4>
                  <ul>
                    {selectedReview.goals.map((goal, idx) => (
                      <li key={idx}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setSelectedReview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
