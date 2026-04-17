import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../pages/AccessDenied';

export default function ProtectedRoute({ children, permission, allowedRoles }) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  return children;
}
