import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { FiMenu, FiBell, FiMessageSquare, FiHelpCircle, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar({ onToggleSidebar, title }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const truncate = (str, n) => (str.length > n ? str.substr(0, n - 1) + "..." : str);

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button className="navbar__toggle" onClick={onToggleSidebar}>
          <FiMenu />
        </button>
        {title && <h1 className="navbar__title">{title}</h1>}
      </div>
      <div className="navbar__right">
        <div className="navbar__notification-wrapper" ref={notificationRef}>
          <button 
            className={`navbar__icon-btn ${showNotifications ? 'navbar__icon-btn--active' : ''}`} 
            title="Notifications"
            onClick={handleToggleNotifications}
          >
            <FiBell />
            {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown__header">
                <h3>Notifications</h3>
                {unreadCount > 0 && <button onClick={handleMarkAllRead}>Mark all as read</button>}
              </div>
              <div className="notification-dropdown__list">
                {notifications.length === 0 ? (
                  <div className="notification-dropdown__empty">
                    <FiBell />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`notification-item ${!n.read ? 'notification-item--unread' : ''}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className={`notification-item__icon notification-item__icon--${n.type}`}>
                        {n.type === 'approve' && <FiCheckCircle />}
                        {n.type === 'reject' && <FiXCircle />}
                        {n.type === 'apply' && <FiInfo />}
                      </div>
                      <div className="notification-item__content">
                        <p className="notification-item__message">{n.message}</p>
                        <span className="notification-item__time">
                          <FiClock /> {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="notification-dropdown__footer">
                <button>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="navbar__divider" />
        <div className="navbar__profile">
          <div className="navbar__profile-avatar">{user?.avatar}</div>
          <div className="navbar__profile-info">
            <span className="navbar__profile-name">{user?.name}</span>
            <span className="navbar__profile-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
