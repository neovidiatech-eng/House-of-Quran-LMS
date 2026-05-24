import { Suspense, lazy } from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import TeacherDashboardLayout from './TeacherDashboardLayout';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import { teacherDashboardRoutes } from './teacherDashboardRoutes.tsx';

const TeacherDashboardHome = lazy(() => import('../../features/teacher/pages/Home'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function TeacherDashboard() {
  return (
    <ErrorBoundary>
      <TeacherDashboardLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route index element={<TeacherDashboardHome />} />
            {teacherDashboardRoutes.flatMap(route => {
              if (route.subItems) {
                return route.subItems.map(subItem => (
                  <Route key={subItem.id} path={subItem.path} element={subItem.element} />
                ));
              }
              return route.element ? [<Route key={route.id} path={route.path} element={route.element} />] : [];
            })}
          </Routes>
          <Outlet />
        </Suspense>
      </TeacherDashboardLayout>
    </ErrorBoundary>
  );
}

