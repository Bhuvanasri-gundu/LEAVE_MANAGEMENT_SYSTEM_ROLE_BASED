import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    // Seed with a few recent items
    { id: 'N-001', userId: 'EMP-002', type: 'approve', message: 'David Wilson\'s Sick Leave approved', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: 'N-002', userId: 'EMP-002', type: 'apply', message: 'John Smith applied for Annual Leave', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false },
    { id: 'N-003', userId: 'EMP-011', type: 'reject', message: 'Your Annual Leave request was rejected', timestamp: new Date(Date.now() - 10800000).toISOString(), read: false },
    { id: 'N-004', userId: 'EMP-001', type: 'approve', message: 'Your Sick Leave (Mar 10 - Mar 12) was approved ✅', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
  ]);

  const addNotification = useCallback((userId, type, message) => {
    const newNotif = {
      id: `N-${Date.now()}`,
      userId,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    if (!user) return;
    setNotifications((prev) => 
      prev.map((n) => n.userId === user.id ? { ...n, read: true } : n)
    );
  }, [user]);

  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter((n) => n.userId === user.id);
  }, [notifications, user]);

  const unreadCount = useMemo(() => 
    userNotifications.filter((n) => !n.read).length, 
  [userNotifications]);

  return (
    <NotificationContext.Provider
      value={{ 
        notifications: userNotifications, 
        addNotification, 
        markRead, 
        markAllRead, 
        unreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
