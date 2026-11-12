import { Suspense, useState } from 'react';
import { Outlet, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import Header from '../../components/layout/Header';
import SupervisorSidebar from './SupervisorSidebar';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { supervisorDashboardRoutes } from './supervisorDashboardRoutes';
import {
  filterAdminRoutesByPermissions,
  getFirstAdminRoutePath,
} from '../../utils/auth';

// Existing Supervisor Pages
const CoursesPage = lazyWithRetry(() => import('../../features/supervisor/pages/courses'));
const ExamsPage = lazyWithRetry(() => import('../../features/supervisor/pages/exams'));
const HomeworkPage = lazyWithRetry(() => import('../../features/supervisor/pages/homework'));
const ProfilePage = lazyWithRetry(() => import('../../features/supervisor/pages/profile'));
const RequestsPage = lazyWithRetry(() => import('../../features/supervisor/pages/requests'));
const SessionsPage = lazyWithRetry(() => import('../../features/supervisor/pages/sessions'));
const UsersPage = lazyWithRetry(() => import('../../features/supervisor/pages/users'));

// Added Admin Pages
const AdminsPage = lazyWithRetry(() => import("../../features/admin/pages/Users"));
const ModeratorsPage = lazyWithRetry(() => import("../../features/admin/pages/Moderator"));
const StudentsPage = lazyWithRetry(() => import("../../features/admin/pages/Students"));
const RanksPage = lazyWithRetry(() => import("../../features/admin/pages/Ranks"));
const ParentsPage = lazyWithRetry(() => import("../../features/admin/pages/Parents"));
const TeachersPage = lazyWithRetry(() => import("../../features/admin/pages/Teachers"));
const TeacherAvailabilityPage = lazyWithRetry(() => import("../../features/admin/pages/TeacherAvailability"));
const SubjectsPage = lazyWithRetry(() => import("../../features/admin/pages/Subjects"));
const AgendaPage = lazyWithRetry(() => import("../../features/admin/pages/Agenda"));
const FeedbackPage = lazyWithRetry(() => import("../../features/admin/pages/Feedback"));
const DailyQuranPage = lazyWithRetry(() => import("../../features/admin/pages/DailyQuran"));
const SubscriptionRequestsPage = lazyWithRetry(() => import("../../features/admin/pages/SubscriptionRequests"));
const TeacherSubscriptionsPage = lazyWithRetry(() => import("../../features/admin/pages/TeacherSubscriptions"));
const AllSubscriptionsPage = lazyWithRetry(() => import("../../features/admin/pages/AllSubscriptions"));
const PlansPage = lazyWithRetry(() => import("../../features/admin/pages/Plans"));
const ViolationsPage = lazyWithRetry(() => import("../../features/supervisor/pages/violations"));
const CurrenciesPage = lazyWithRetry(() => import("../../features/admin/pages/Currencies"));
const ExpensesPage = lazyWithRetry(() => import("../../features/admin/pages/Expenses"));
const TransactionsPage = lazyWithRetry(() => import("../../features/admin/pages/Transactions"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function SupervisorDashboard() {
  const { i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const language = i18n.language.split('-')[0];
  const isRtl = language === 'ar';

  const role = localStorage.getItem('role');
  const visibleRoutes = filterAdminRoutesByPermissions(supervisorDashboardRoutes, role);
  const firstAllowedPath = getFirstAdminRoutePath(visibleRoutes);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          userRole="supervisor" 
          userName="Supervisor" 
          userEmail="supervisor@example.com" 
          isCollapsed={isCollapsed} 
        />
        
        <SupervisorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        
        <main className={`${isRtl ? (isCollapsed ? 'lg:mr-20' : 'lg:mr-72') : (isCollapsed ? 'lg:ml-20' : 'lg:ml-72')} transition-all duration-300`}>
          <div className={`transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'}`}>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route index element={<Navigate to={firstAllowedPath || '/login'} replace />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="homework" element={<HomeworkPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="users" element={<UsersPage />} />
              
              <Route path="admins" element={<AdminsPage />} />
              <Route path="moderators" element={<ModeratorsPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="ranks" element={<RanksPage />} />
              <Route path="parents" element={<ParentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="teacher-availability" element={<TeacherAvailabilityPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="daily-quran" element={<DailyQuranPage />} />
              <Route path="subscription-requests" element={<SubscriptionRequestsPage />} />
              <Route path="teacher-subscriptions" element={<TeacherSubscriptionsPage />} />
              <Route path="all-subscriptions" element={<AllSubscriptionsPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="violations" element={<ViolationsPage />} />
              <Route path="currencies" element={<CurrenciesPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
            </Routes>
            <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
