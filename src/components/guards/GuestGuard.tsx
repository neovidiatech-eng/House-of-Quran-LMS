import { Navigate, Outlet } from 'react-router-dom';
import { getDashboardPathForRole } from '../../utils/auth';

const GuestGuard = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (role) return <Navigate to={getDashboardPathForRole(role)} replace />;
    
    // If token exists but no role is found, clear and stay at login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
