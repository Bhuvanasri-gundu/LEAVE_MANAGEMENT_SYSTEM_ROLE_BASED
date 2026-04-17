import { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import './App.css';

function AppLayout() {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoginPage = location.pathname === '/login';

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
        <span className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (isLoginPage || !user) {
    return <AppRoutes />;
  }

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/pim/employees': 'PIM',
      '/pim/add-employee': 'PIM',
      '/leave/list': 'Leave',
      '/leave/apply': 'Leave',
      '/leave/my-leaves': 'Leave',
      '/leave/assign': 'Leave',
      '/leave/types': 'Leave',
      '/leave/work-week': 'Leave',
      '/leave/holidays': 'Leave',
      '/time': 'Time',
      '/performance': 'Performance',
      '/recruitment': 'Recruitment',
      '/my-info': 'My Info',
      '/directory': 'Directory',
      '/access-denied': 'Access Denied',
    };
    return titles[path] || '';
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`app-layout__main ${sidebarCollapsed ? 'app-layout__main--expanded' : ''}`}>
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} title={getPageTitle()} />
        <main className="app-layout__content">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeaveProvider>
          <EmployeeProvider>
            <ToastProvider>
              <NotificationProvider>
                <AppLayout />
              </NotificationProvider>
            </ToastProvider>
          </EmployeeProvider>
        </LeaveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
