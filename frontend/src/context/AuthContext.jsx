import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, getMe } from '../services/api';

const AuthContext = createContext(null);

const ROLE_PERMISSIONS = {
  Admin: {
    dashboard: true, pim: true, pimAdd: true, leaveList: true, applyLeave: true,
    myLeave: true, assignLeave: true, leaveTypes: true, workWeek: true,
    holidays: true, time: true, performance: true,
    myInfo: true,
  },
  Manager: {
    dashboard: true, pim: false, pimAdd: false, leaveList: true, applyLeave: true,
    myLeave: true, assignLeave: false, leaveTypes: false, workWeek: false,
    holidays: false, time: true, performance: true,
    myInfo: true,
  },
  Employee: {
    dashboard: true, pim: false, pimAdd: false, leaveList: false, applyLeave: true,
    myLeave: true, assignLeave: false, leaveTypes: false, workWeek: false,
    holidays: true, time: false, performance: false,
    myInfo: true,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(true);

  // On mount: re-validate token with /auth/me
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthLoading(false); return; }
    try {
      const res = await getMe();
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      // Token invalid or expired — clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => { validateToken(); }, [validateToken]);

  /**
   * login: calls POST /auth/login, stores token + user, updates state.
   * Returns { user } on success, throws on failure.
   */
  const login = async (email, password, role) => {
    const res = await loginUser(email, password, role);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
