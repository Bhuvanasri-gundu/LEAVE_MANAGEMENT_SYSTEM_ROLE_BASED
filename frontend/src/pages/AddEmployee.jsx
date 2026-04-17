import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import { TextInput, FileUpload } from '../components/FormInputs';
import { addEmployee, updateEmployee, getEmployeeById } from '../services/api';
import { useEmployees } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { FiSave, FiX } from 'react-icons/fi';
import './Pages.css';

export default function AddEmployee() {
  const navigate = useNavigate();
  const { refreshEmployees } = useEmployees();
  const { addToast } = useToast();
  const { id: employeeIdParam } = useParams();
  const isEdit = !!employeeIdParam;

  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', employeeId: '',
    email: '', password: '', role: 'Employee', jobTitle: '', subUnit: '', supervisor: '', team: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [profileImage, setProfileImage] = useState(null);

  // Fetch employee data if editing
  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await getEmployeeById(employeeIdParam);
          const data = res.data.data;
          setForm({
            firstName: data.firstName || '',
            middleName: data.middleName || '',
            lastName: data.lastName || '',
            employeeId: data.id || '',
            email: data.email || '',
            password: '', // Don't pre-fill password
            role: data.role || 'Employee',
            jobTitle: data.jobTitle || '',
            subUnit: data.subUnit || '',
            supervisor: data.supervisor || '',
            team: data.team || '',
          });
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to load employee', 'error');
          navigate('/pim/employees');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [employeeIdParam, isEdit, navigate, addToast]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return alert('First and Last name are required.');
    if (!form.email) return alert('Email is required.');
    if (!form.subUnit) return alert('Department (SubUnit) is required.');
    if (!isEdit && !form.password) return alert('Password is required.');
    
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        email: form.email,
        role: form.role || 'Employee',
        jobTitle: form.jobTitle || '',
        subUnit: form.subUnit,
        supervisor: form.supervisor || '',
        team: form.team || '',
      };

      // Add password only for new employees
      if (!isEdit) {
        payload.password = form.password;
        payload.employeeId = form.employeeId || undefined;
      }

      if (isEdit) {
        await updateEmployee(employeeIdParam, payload);
        addToast('Employee updated successfully ✅', 'success');
      } else {
        await addEmployee(payload);
        addToast('Employee added successfully ✅', 'success');
      }

      await refreshEmployees();
      navigate('/pim/employees');
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} employee`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page__header">
          <h2 className="page__title">Edit Employee</h2>
        </div>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner spinner--large" style={{ margin: '0 auto 20px' }} />
            <p>Loading employee data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="add-employee-form">
          <div className="add-employee-form__image-section">
            <div className="profile-image-placeholder">
              {profileImage ? (
                <img src={URL.createObjectURL(profileImage)} alt="Profile" className="profile-image-preview" />
              ) : (
                <div className="profile-image-default">
                  <span>📷</span>
                  <p>Profile Photo</p>
                </div>
              )}
            </div>
            <FileUpload
              label=""
              accept="image/*"
              id="profile-image"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
          </div>

          <div className="add-employee-form__fields">
            <div className="form-row form-row--3">
              <TextInput label="First Name" value={form.firstName} onChange={handleChange('firstName')} required id="emp-first" placeholder="Enter first name" />
              <TextInput label="Middle Name" value={form.middleName} onChange={handleChange('middleName')} id="emp-middle" placeholder="Enter middle name" />
              <TextInput label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required id="emp-last" placeholder="Enter last name" />
            </div>

            <div className="form-row">
              <TextInput 
                label="Employee ID" 
                value={form.employeeId} 
                onChange={handleChange('employeeId')} 
                id="emp-id" 
                placeholder="Auto-generated if empty" 
                disabled={isEdit}
              />
            </div>

            <div className="form-row form-row--2">
              <TextInput label="Email" value={form.email} onChange={handleChange('email')} id="login-email" type="email" placeholder="employee@company.com" required />
              {!isEdit && (
                <TextInput label="Password" value={form.password} onChange={handleChange('password')} id="login-pass" type="password" placeholder="Min 6 characters" required />
              )}
            </div>

            <div className="form-row form-row--2">
              <TextInput label="Job Title" value={form.jobTitle} onChange={handleChange('jobTitle')} id="emp-jobTitle" placeholder="e.g., Software Engineer" />
              <TextInput label="Department (SubUnit)" value={form.subUnit} onChange={handleChange('subUnit')} id="emp-subUnit" placeholder="e.g., Engineering" required />
            </div>

            <div className="form-row form-row--2">
              <TextInput label="Supervisor" value={form.supervisor} onChange={handleChange('supervisor')} id="emp-supervisor" placeholder="Supervisor name" />
              <TextInput label="Team" value={form.team} onChange={handleChange('team')} id="emp-team" placeholder="Team name" />
            </div>

            <div className="form-row">
              <label htmlFor="emp-role" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Role
              </label>
              <select 
                id="emp-role" 
                value={form.role} 
                onChange={handleChange('role')}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/pim/employees')}>
              <FiX /> Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <span className="spinner spinner--small" /> : <><FiSave /> {isEdit ? 'Update' : 'Save'}</>}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
