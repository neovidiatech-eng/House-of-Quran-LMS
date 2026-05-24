import { useState, lazy, Suspense } from 'react';
import { Navigate, Outlet, Routes, Route } from 'react-router-dom';
import Header from '../../components/layout/Header';
import AdminSidebar from './AdminSidebar';
import SubscribePlanModal from '../../components/modals/SubscribePlanModal';
import { useTranslation } from 'react-i18next';
import { adminDashboardRoutes } from './adminDashboardRoutes';
import {
  filterAdminRoutesByPermissions,
  getFirstAdminRoutePath,
  isFullAccessRole
} from '../../utils/auth';

// --- Lazy Loading Dashboard Home ---
const AdminDashboardHome = lazy(() => import('../../features/admin/pages/Dashboard'));

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const language = i18n.language.split('-')[0];
  const isRtl = language === 'ar';
  const role = localStorage.getItem('role');
  const visibleRoutes = filterAdminRoutesByPermissions(adminDashboardRoutes, role);
  const firstAllowedPath = getFirstAdminRoutePath(visibleRoutes);
  const canViewDashboardHome = visibleRoutes.some(route => route.id === 'dashboard');
  const dashboardIndexElement = isFullAccessRole(role) || canViewDashboardHome
    ? <AdminDashboardHome />
    : <Navigate to={firstAllowedPath || '/login'} replace />;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="admin"
        userName="Super Admin"
        userEmail="admin@admin.com"
        isCollapsed={isCollapsed}
      />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main className={`${isRtl ? (isCollapsed ? 'lg:mr-20' : 'lg:mr-72') : (isCollapsed ? 'lg:ml-20' : 'lg:ml-72')} transition-all duration-300`}>
        <div className={`transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'}`}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] animate-pulse text-gray-400">Loading...</div>}>
            <Routes>
              <Route index element={dashboardIndexElement} />
              {visibleRoutes.flatMap(route => {
                if (route.subItems) {
                  return route.subItems.map(subItem => (
                    <Route key={subItem.id} path={subItem.path} element={subItem.element} />
                  ));
                }
                return route.element ? [<Route key={route.id} path={route.path} element={route.element} />] : [];
              })}
              <Route path="*" element={<Navigate to={firstAllowedPath || '/login'} replace />} />
            </Routes>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <SubscribePlanModal isOpen={showSubscribeModal} onClose={() => setShowSubscribeModal(false)} />
    </div>
  );
}

