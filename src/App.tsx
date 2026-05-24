import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionsProvider } from './contexts/SessionsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import ErrorBoundary from './components/layout/ErrorBoundary';
import LanguageSwitcher from './components/ui/LanguageSwitcher';


// import { adminDashboardRoutes } from './pages/AdminDashboard/adminDashboardRoutes';
// import { studentDashboardRoutes } from './pages/StudentDashboard/studentDashboardRoutes';
// import { teacherDashboardRoutes } from './pages/TeacherDashboard/teacherDashboardRoutes.tsx';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { googleClientId } from './components/constants';

// --- Lazy Loading Core Layouts & Pages ---
const AuthLayout = lazy(() => import('./pages/AuthLayout/AuthLayout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyAccount = lazy(() => import('./pages/VerifyAccount'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));
const StudentDashboard = lazy(() => import('./features/student/pages/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard/TeacherDashboard'));
import AuthGuard from './components/guards/AuthGuard';
import GuestGuard from './components/guards/GuestGuard';
import { Provider } from "react-redux";
import { store } from './store/store';
import { useChatSocket } from './hooks/useChat';
const ParentDashboard = lazy(() => import('./features/parent/pages/ParentDashboard'));

// Centralized Loading Fallback UI
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Create a client with global options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
  });
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language.split('-')[0];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [i18n.language]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };


function SocketProvider() {
  useChatSocket();
  return null;
}
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={googleClientId}>
          <QueryClientProvider client={queryClient}>
            <SettingsProvider>
              <SessionsProvider>
                <Router >
                  {!isAuthenticated && <LanguageSwitcher />}
                  {isAuthenticated && <SocketProvider />}
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Auth Routes */}
                      <Route element={<GuestGuard />}>
                        <Route element={<AuthLayout />}>
                          <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
                          <Route path="/register" element={<Register onRegisterSuccess={handleLogin} />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/verify-account" element={<VerifyAccount onVerifySuccess={handleLogin} />} />
                        </Route>
                      </Route>

                      {/* Protected Dashboard Routes */}
                      <Route element={<AuthGuard allowedRoles={['super_admin', 'admin']} allowCustomAdminRoles />}>
                        <Route path="/dashboard/*" element={<AdminDashboard />} />
                      </Route>


                      <Route element={<AuthGuard allowedRoles={['student']} />}>
                        <Route path="/student-dashboard/*" element={<StudentDashboard />} />
                      </Route>


                      <Route element={<AuthGuard allowedRoles={['teacher']} />}>
                        <Route path="/teacher-dashboard/*" element={<TeacherDashboard />} />
                      </Route>

                      <Route element={<AuthGuard allowedRoles={['parent']} />}>
                        <Route path="/parent-dashboard/*" element={<ParentDashboard />} />
                      </Route>


                      <Route path="/" element={<Navigate to="/login" replace />} />
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                  </Suspense>
                </Router>
              </SessionsProvider>
            </SettingsProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
