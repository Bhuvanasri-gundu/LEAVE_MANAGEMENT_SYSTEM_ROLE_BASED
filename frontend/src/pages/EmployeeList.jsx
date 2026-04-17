import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Table from '../components/Table';
import { TextInput, SelectInput } from '../components/FormInputs';
import { deleteEmployee } from '../services/api';
import { useEmployees } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiRefreshCw } from 'react-icons/fi';
import './Pages.css';

const statusOptions = ['Full-Time Permanent', 'Full-Time Contract', 'Part-Time', 'Freelance', 'Probation'];

export default function EmployeeList() {
  const navigate = useNavigate();
  const { employees: contextEmployees, employeeLoading, fetchEmployees, removeEmployeeFromStore } = useEmployees();
  const { addToast } = useToast();
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    name: '', id: '', status: '', jobTitle: '', subUnit: '', supervisor: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    handleFilter();
  }, [contextEmployees]);

  const handleFilter = () => {
    let result = [...contextEmployees];
    if (filters.name) result = result.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
    );
    if (filters.id) result = result.filter((e) =>
      e.id.toLowerCase().includes(filters.id.toLowerCase())
    );
    if (filters.status) result = result.filter((e) => e.employmentStatus === filters.status);
    if (filters.jobTitle) result = result.filter((e) =>
      e.jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase())
    );
    if (filters.subUnit) result = result.filter((e) =>
      e.subUnit.toLowerCase().includes(filters.subUnit.toLowerCase())
    );
    if (filters.supervisor) result = result.filter((e) =>
      e.supervisor.toLowerCase().includes(filters.supervisor.toLowerCase())
    );
    setFiltered(result);
  };

  const handleReset = () => {
    setFilters({ name: '', id: '', status: '', jobTitle: '', subUnit: '', supervisor: '' });
    setFiltered(contextEmployees);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        removeEmployeeFromStore(id);
        setFiltered((prev) => prev.filter((e) => e.id !== id));
        addToast('Employee deleted successfully ✅', 'success');
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete employee', 'error');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/pim/edit-employee/${id}`);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'jobTitle', label: 'Job Title' },
    {
      key: 'employmentStatus', label: 'Status',
      render: (val) => <span className={`status-badge status-badge--${val === 'Full-Time Permanent' ? 'approved' : 'pending'}`}>{val}</span>
    },
    { key: 'subUnit', label: 'Sub Unit' },
    { key: 'supervisor', label: 'Supervisor' },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Employee Information</h2>
        <button className="btn btn--primary" onClick={() => navigate('/pim/add-employee')}>
          <FiPlus /> Add Employee
        </button>
      </div>

      <Card title="Filters" icon="🔍" className="page__filters">
        <div className="filter-grid">
          <TextInput
            label="Employee Name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            placeholder="Type for hints..."
            id="filter-name"
          />
          <TextInput
            label="Employee ID"
            value={filters.id}
            onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            placeholder="Enter ID"
            id="filter-id"
          />
          <SelectInput
            label="Employment Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
            placeholder="-- All --"
            id="filter-status"
          />
          <TextInput
            label="Job Title"
            value={filters.jobTitle}
            onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
            placeholder="Search job title"
            id="filter-job"
          />
          <TextInput
            label="Sub Unit"
            value={filters.subUnit}
            onChange={(e) => setFilters({ ...filters, subUnit: e.target.value })}
            placeholder="Search department"
            id="filter-unit"
          />
          <TextInput
            label="Supervisor Name"
            value={filters.supervisor}
            onChange={(e) => setFilters({ ...filters, supervisor: e.target.value })}
            placeholder="Supervisor name"
            id="filter-supervisor"
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--secondary" onClick={handleReset}><FiRefreshCw /> Reset</button>
          <button className="btn btn--primary" onClick={handleFilter}><FiSearch /> Search</button>
        </div>
      </Card>

      <Card title={`Records Found (${filtered.length})`} icon="👥">
        {employeeLoading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            emptyMessage="No employees match the criteria"
            actions={(row) => (
              <>
                <button className="btn-action btn-action--edit" title="Edit" onClick={() => handleEdit(row.id)}><FiEdit2 /></button>
                <button className="btn-action btn-action--delete" title="Delete" onClick={() => handleDelete(row.id)}><FiTrash2 /></button>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
