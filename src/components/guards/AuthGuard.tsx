import { Navigate, Outlet } from 'react-router-dom';
import { getDashboardPathForRole, isAdminDashboardRole } from '../../utils/auth';

interface AuthGuardProps {
  allowedRoles?: string[];
  allowCustomAdminRoles?: boolean;
}

const AuthGuard = ({ allowedRoles, allowCustomAdminRoles = false }: AuthGuardProps) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  const isAllowedCustomAdmin =
    allowCustomAdminRoles && isAdminDashboardRole(role);

  if (allowedRoles && !allowedRoles.includes(role || '') && !isAllowedCustomAdmin) {
    console.warn(`Access denied for role: ${role}. Allowed roles: ${allowedRoles}`);

    if (role) return <Navigate to={getDashboardPathForRole(role)} replace />;

    // If no valid role is found, clear and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
