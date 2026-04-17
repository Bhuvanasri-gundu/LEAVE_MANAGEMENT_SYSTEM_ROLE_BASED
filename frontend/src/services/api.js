import axios from 'axios';
import timesheetsMockData from '../data/timesheets.json';
import performanceReviewsMockData from '../data/performanceReviews.json';

// ── Axios instance ──────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leave-management-system-role-based.onrender.com/api';
console.log('🔌 API Base URL:', API_BASE_URL);
console.log('🔌 Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

// 401 → clear session and redirect to login (except for file requests)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isFileRequest = error.config?.url?.includes('/uploads');
    
    // Enhanced error logging
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401) {
      // Only logout for protected API routes, not for file/upload requests
      if (!isLoginRequest && !isFileRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Dispatch global error event only for server errors (5xx), not validation errors (4xx)
    if (!isLoginRequest && !isFileRequest && error.response?.status >= 500) {
      const msg = error.response?.data?.message || error.message || 'An API error occurred';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', { detail: { message: msg } }));
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (email, password, role) =>
  api.post('/auth/login', { email, password, role });

export const registerUser = (data) =>
  api.post('/auth/register', data);

export const getMe = () =>
  api.get('/auth/me');

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (email, newPassword) =>
  api.post('/auth/reset-password', { email, newPassword });

// ── Employees ────────────────────────────────────────────────────────────────
export const getEmployees = () => api.get('/employees');

export const getEmployeeById = (id) => api.get(`/employees/${id}`);

export const addEmployee = (data) => api.post('/employees', data);

export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);

export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// ── Leaves ───────────────────────────────────────────────────────────────────
// Returns { data: [...] }  — shape matches old mock
export const getLeaves = () => api.get('/leaves');

// Accepts a FormData (with optional document) or plain object
export const applyLeave = (formData) =>
  api.post('/leaves', formData, {
    headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });

// PATCH /leaves/:id  → { status, managerComment }
export const updateLeaveStatus = (id, status, managerComment = '') =>
  api.patch(`/leaves/${id}`, { status, managerComment });

// PATCH /leaves/:id/document-verify → { documentStatus }
export const verifyDocument = (id, documentStatus) =>
  api.patch(`/leaves/${id}/document-verify`, { documentStatus });

// DELETE /leaves/:id  (cancel)
export const cancelLeave = (id) => api.delete(`/leaves/${id}`);

// Conflict check: GET /leaves/conflict-check?fromDate=&toDate=
export const checkConflict = (fromDate, toDate) =>
  api.get('/leaves/conflict-check', { params: { fromDate, toDate } });

// ── Leave Types ───────────────────────────────────────────────────────────────
export const getLeaveTypes = () => api.get('/leave-types');

export const addLeaveType = (data) => api.post('/leave-types', data);

// ── Holidays ──────────────────────────────────────────────────────────────────
export const getHolidays = () => api.get('/holidays');

export const addHoliday = (data) => api.post('/holidays', data);

// ── Departments (no backend route, return empty — UI still renders) ───────────
export const getDepartments = async () => ({ data: [] });

// ── Timesheets & Performance (using mock data) ────────────────────────────────
/**
 * Get all timesheets
 * Returns mock data from timesheets.json
 */
export const getTimesheets = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: timesheetsMockData };
};

/**
 * Get timesheets by employee name
 * Filters mock data by employee name
 */
export const getTimesheetsByEmployee = async (employeeName) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const filtered = timesheetsMockData.filter(ts => 
    ts.employeeName.toLowerCase().includes(employeeName.toLowerCase())
  );
  return { data: filtered };
};

/**
 * Get all performance reviews
 * Returns mock data from performanceReviews.json
 */
export const getPerformanceReviews = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: performanceReviewsMockData };
};

export default api;
