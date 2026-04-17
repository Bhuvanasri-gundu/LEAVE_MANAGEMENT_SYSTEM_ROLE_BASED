import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiUsers, FiCalendar, FiClock, FiStar,
  FiBriefcase, FiUser, FiBook, FiChevronDown, FiChevronRight,
  FiLogOut, FiSearch
} from 'react-icons/fi';
import { useState } from 'react';
import './Sidebar.css';

/**
 * Sidebar menu config with strict role-based visibility.
 *
 * Admin:  All modules
 * Manager: Dashboard, Leave (Apply, My Leave, Leave List), Time, Performance, My Info
 * Employee: Dashboard, Leave (Apply, My Leave, Holidays view-only), My Info
 */
const menuConfig = [
  {
    label: 'Dashboard',
    icon: FiGrid,
    path: '/dashboard',
    permission: 'dashboard',
  },
  {
    label: 'PIM',
    icon: FiUsers,
    permission: 'pim',
    allowedRoles: ['Admin'],
    children: [
      { label: 'Employee List', path: '/pim/employees', permission: 'pim' },
      { label: 'Add Employee', path: '/pim/add-employee', permission: 'pimAdd' },
    ],
  },
  {
    label: 'Leave',
    icon: FiCalendar,
    permission: 'applyLeave',
    children: [
      { label: 'Apply Leave', path: '/leave/apply', permission: 'applyLeave' },
      { label: 'My Leave', path: '/leave/my-leaves', permission: 'myLeave' },
      { label: 'Leave List', path: '/leave/list', permission: 'leaveList', allowedRoles: ['Admin', 'Manager'] },
      { label: 'Assign Leave', path: '/leave/assign', permission: 'assignLeave', allowedRoles: ['Admin'] },
      { label: 'Leave Types', path: '/leave/types', permission: 'leaveTypes', allowedRoles: ['Admin'] },
      { label: 'Work Week', path: '/leave/work-week', permission: 'workWeek', allowedRoles: ['Admin'] },
      { label: 'Holidays', path: '/leave/holidays', permission: 'holidays', allowedRoles: ['Admin', 'Employee'] },
    ],
  },
  {
    label: 'Time',
    icon: FiClock,
    path: '/time',
    permission: 'time',
    allowedRoles: ['Admin', 'Manager'],
  },
  {
    label: 'Performance',
    icon: FiStar,
    path: '/performance',
    permission: 'performance',
    allowedRoles: ['Admin', 'Manager'],
  },
  {
    label: 'My Info',
    icon: FiUser,
    path: '/my-info',
    permission: 'myInfo',
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, hasPermission, logout } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (children) =>
    children?.some((child) => location.pathname.startsWith(child.path));

  // Check if a menu item is visible for the current role
  const isItemVisible = (item) => {
    // If allowedRoles is set, check role
    if (item.allowedRoles && !item.allowedRoles.includes(user?.role)) {
      return false;
    }
    // Check permission
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    return true;
  };

  const filteredMenu = menuConfig.filter((item) => {
    if (!isItemVisible(item)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.children) return item.children.some((c) => c.label.toLowerCase().includes(q) && isItemVisible(c));
      return false;
    }
    return true;
  });

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🔶</span>
          {!collapsed && <span className="sidebar__logo-text">SmartLeave</span>}
        </div>
      </div>

      {!collapsed && (
        <div className="sidebar__search">
          <FiSearch className="sidebar__search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar__search-input"
          />
        </div>
      )}

      <nav className="sidebar__nav">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const visibleChildren = item.children?.filter((child) =>
            isItemVisible(child) &&
            (!searchQuery || child.label.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          if (item.children && visibleChildren?.length > 0) {
            const expanded = expandedMenus[item.label] || isParentActive(visibleChildren);
            return (
              <div key={item.label} className="sidebar__menu-group">
                <button
                  className={`sidebar__menu-item sidebar__menu-item--parent ${isParentActive(visibleChildren) ? 'sidebar__menu-item--active' : ''}`}
                  onClick={() => toggleMenu(item.label)}
                >
                  <Icon className="sidebar__menu-icon" />
                  {!collapsed && (
                    <>
                      <span className="sidebar__menu-label">{item.label}</span>
                      {expanded ? (
                        <FiChevronDown className="sidebar__menu-arrow" />
                      ) : (
                        <FiChevronRight className="sidebar__menu-arrow" />
                      )}
                    </>
                  )}
                </button>
                {expanded && !collapsed && (
                  <div className="sidebar__submenu">
                    {visibleChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={`sidebar__submenu-item ${isActive(child.path) ? 'sidebar__submenu-item--active' : ''}`}
                      >
                        <span className="sidebar__submenu-dot" />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (item.path) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar__menu-item ${isActive(item.path) ? 'sidebar__menu-item--active' : ''}`}
              >
                <Icon className="sidebar__menu-icon" />
                {!collapsed && <span className="sidebar__menu-label">{item.label}</span>}
              </NavLink>
            );
          }
          return null;
        })}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && user && (
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">{user.avatar}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.name}</span>
              <span className="sidebar__user-role">{user.role}</span>
            </div>
          </div>
        )}
        <button className="sidebar__logout" onClick={logout} title="Logout">
          <FiLogOut className="sidebar__menu-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
