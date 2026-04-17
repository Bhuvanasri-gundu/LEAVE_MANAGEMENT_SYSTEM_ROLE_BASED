import { useNavigate } from 'react-router-dom';
import { FiShield, FiArrowLeft } from 'react-icons/fi';
import './Pages.css';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="access-denied">
      <div className="access-denied__card">
        <div className="access-denied__icon">
          <FiShield />
        </div>
        <h2 className="access-denied__title">Access Denied</h2>
        <p className="access-denied__message">
          You don't have permission to access this page. Please contact your administrator
          if you believe this is an error.
        </p>
        <button className="btn btn--primary" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
