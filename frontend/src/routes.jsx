import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import LeaveList from './pages/LeaveList';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import AssignLeave from './pages/AssignLeave';
import LeaveTypes from './pages/LeaveTypes';
import WorkWeek from './pages/WorkWeek';
import Holidays from './pages/Holidays';
import Timesheets from './pages/Timesheets';
import Performance from './pages/Performance';
import MyInfo from './pages/MyInfo';
import AccessDenied from './pages/AccessDenied';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route path="/dashboard" element={
        <ProtectedRoute permission="dashboard"><Dashboard /></ProtectedRoute>
      } />

      {/* PIM — Admin only */}
      <Route path="/pim/employees" element={
        <ProtectedRoute allowedRoles={['Admin']}><EmployeeList /></ProtectedRoute>
      } />
      <Route path="/pim/add-employee" element={
        <ProtectedRoute allowedRoles={['Admin']}><AddEmployee /></ProtectedRoute>
      } />
      <Route path="/pim/edit-employee/:id" element={
        <ProtectedRoute allowedRoles={['Admin']}><AddEmployee /></ProtectedRoute>
      } />

      {/* Leave */}
      <Route path="/leave/list" element={
        <ProtectedRoute allowedRoles={['Admin', 'Manager']}><LeaveList /></ProtectedRoute>
      } />
      <Route path="/leave/apply" element={
        <ProtectedRoute permission="applyLeave"><ApplyLeave /></ProtectedRoute>
      } />
      <Route path="/leave/my-leaves" element={
        <ProtectedRoute permission="myLeave"><MyLeaves /></ProtectedRoute>
      } />
      <Route path="/leave/assign" element={
        <ProtectedRoute allowedRoles={['Admin']}><AssignLeave /></ProtectedRoute>
      } />
      <Route path="/leave/types" element={
        <ProtectedRoute allowedRoles={['Admin']}><LeaveTypes /></ProtectedRoute>
      } />
      <Route path="/leave/work-week" element={
        <ProtectedRoute allowedRoles={['Admin']}><WorkWeek /></ProtectedRoute>
      } />
      <Route path="/leave/holidays" element={
        <ProtectedRoute allowedRoles={['Admin', 'Employee']}><Holidays /></ProtectedRoute>
      } />

      {/* Time — Admin + Manager */}
      <Route path="/time" element={
        <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Timesheets /></ProtectedRoute>
      } />

      {/* Performance — Admin + Manager */}
      <Route path="/performance" element={
        <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Performance /></ProtectedRoute>
      } />

      {/* My Info — All roles */}
      <Route path="/my-info" element={
        <ProtectedRoute permission="myInfo"><MyInfo /></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
