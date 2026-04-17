import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { forgotPassword as forgotPasswordApi, resetPassword as resetPasswordApi } from '../services/api';
import './Login.css';

const ROLE_ROUTES = {
  Admin: '/dashboard',
  Manager: '/dashboard',
  Employee: '/dashboard',
};

export default function Login() {
  const [viewState, setViewState] = useState('login'); // 'login' | 'forgot' | 'reset'

  // Form states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const roles = [
    { value: 'Admin', label: 'Admin', description: 'Full system access', icon: '🛡️', color: '#e8833a' },
    { value: 'Manager', label: 'Manager', description: 'Team management access', icon: '👤', color: '#3b82f6' },
    { value: 'Employee', label: 'Employee', description: 'Self-service access', icon: '💼', color: '#22c55e' },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    let isValid = true;
    if (!email) {
      setEmailError('Invalid email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Invalid email or password');
      isValid = false;
    }

    if (!selectedRole) {
      setPasswordError('Please select a role');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      const user = await login(email, password, selectedRole);
      addToast(`Welcome back, ${user.name}! `, 'success');
      navigate(ROLE_ROUTES[user.role] || '/dashboard');
    } catch (err) {
      // Map API errors to inline fields
      const msg = err.response?.data?.message || 'Login failed';
      if (msg.toLowerCase().includes('role')) {
        setPasswordError(msg);
      } else if (msg.toLowerCase().includes('email')) {
        setEmailError(msg);
      } else {
        setPasswordError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setEmailError('');

    let isValid = true;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      await forgotPasswordApi(email);
      addToast('Email verified. Proceed to reset.', 'success');
      setViewState('reset');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Email not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setNewPasswordError('');
    setConfirmPasswordError('');

    let isValid = true;
    if (!newPassword || newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      await resetPasswordApi(email, newPassword);
      addToast('Password reset successfully! Please login.', 'success');
      setViewState('login');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setConfirmPasswordError(err.response?.data?.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper styles for common input rendering
  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  });

  const errorTextStyle = {
    color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'
  };

  return (
    <div className="login">
      <div className="login__bg">
        <div className="login__bg-shape login__bg-shape--1" />
        <div className="login__bg-shape login__bg-shape--2" />
        <div className="login__bg-shape login__bg-shape--3" />
      </div>

      <div className="login__card">
        <div className="login__header">
          <div className="login__logo">
            <span className="login__logo-icon">🔶</span>
            <h1 className="login__logo-text">SmartLeave</h1>
          </div>
          <p className="login__subtitle">
            {viewState === 'login' && 'Smart Leave Management System'}
            {viewState === 'forgot' && 'Account Recovery'}
            {viewState === 'reset' && 'Create New Password'}
          </p>
        </div>

        {viewState === 'login' && (
          <>
            <div className="login__roles" style={{ marginBottom: '20px' }}>
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`login__role-card ${selectedRole === role.value ? 'login__role-card--selected' : ''}`}
                  onClick={() => handleRoleSelect(role.value)}
                  style={{ '--role-color': role.color }}
                >
                  <span className="login__role-icon">{role.icon}</span>
                  <span className="login__role-name">{role.label}</span>
                  <span className="login__role-desc">{role.description}</span>
                  {selectedRole === role.value && <span className="login__role-check">✓</span>}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="login__form">
              <div className="login__field">
                <label className="login__label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className={`login__input ${emailError ? 'login__input--error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="you@smartleave.com"
                  autoComplete="email"
                  style={inputStyle(emailError)}
                />
                {emailError && <span style={errorTextStyle}>{emailError}</span>}
              </div>

              <div className="login__field" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="login__label" htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewState('forgot');
                      setEmailError('');
                      setPasswordError('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  className={`login__input ${passwordError ? 'login__input--error' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={inputStyle(passwordError)}
                />
                {passwordError && <span style={errorTextStyle}>{passwordError}</span>}
              </div>

              <button
                type="submit"
                className={`login__submit ${isLoading ? 'login__submit--loading' : ''}`}
                disabled={isLoading}
                style={{ marginTop: '20px' }}
              >
                {isLoading ? <span className="login__spinner" /> : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {viewState === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="login__form">
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.5' }}>
              Enter the email address associated with your account, and we'll help you reset your password.
            </p>
            <div className="login__field">
              <label className="login__label" htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                className={`login__input ${emailError ? 'login__input--error' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="you@smartleave.com"
                autoComplete="email"
                style={inputStyle(emailError)}
              />
              {emailError && <span style={errorTextStyle}>{emailError}</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setViewState('login')}
                style={{
                  flex: '1', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db',
                  background: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
              <button
                type="submit"
                className={`login__submit ${isLoading ? 'login__submit--loading' : ''}`}
                disabled={isLoading}
                style={{ flex: '2', marginTop: 0 }}
              >
                {isLoading ? <span className="login__spinner" /> : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {viewState === 'reset' && (
          <form onSubmit={handleResetPassword} className="login__form">
            <div className="login__field">
              <label className="login__label" htmlFor="reset-password">New Password</label>
              <input
                id="reset-password"
                type="password"
                className={`login__input ${newPasswordError ? 'login__input--error' : ''}`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError('');
                }}
                placeholder="••••••••"
                style={inputStyle(newPasswordError)}
              />
              {newPasswordError && <span style={errorTextStyle}>{newPasswordError}</span>}
            </div>

            <div className="login__field" style={{ marginTop: '12px' }}>
              <label className="login__label" htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className={`login__input ${confirmPasswordError ? 'login__input--error' : ''}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                placeholder="••••••••"
                style={inputStyle(confirmPasswordError)}
              />
              {confirmPasswordError && <span style={errorTextStyle}>{confirmPasswordError}</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setViewState('login')}
                style={{
                  flex: '1', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db',
                  background: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`login__submit ${isLoading ? 'login__submit--loading' : ''}`}
                disabled={isLoading}
                style={{ flex: '2', marginTop: 0 }}
              >
                {isLoading ? <span className="login__spinner" /> : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="login__footer">
          <p>© 2026 SmartLeave. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
