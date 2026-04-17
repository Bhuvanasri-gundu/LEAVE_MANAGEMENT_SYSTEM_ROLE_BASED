import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Manager') return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
