import {
  BarChart3,
  BookOpen,
  FileText,
  User,
  MessageSquare,
  Send,
  Users,
  Play,
  Calendar,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import { RouteConfig } from '../../components/constants/dashboardRoutes';

import { lazyWithRetry } from '../../utils/lazyWithRetry';

// Reuse dashboard components for content viewing
// Lazy Loading Page Components for Teacher from Features
const DashboardOverview = lazyWithRetry(() => import('../../features/teacher/pages/Home'));
const ProfilePage = lazyWithRetry(() => import('../../features/teacher/pages/Profile'));
const LMSCoursesPage = lazyWithRetry(() => import('../../features/teacher/pages/LMSCourses/LMSCourses'));
const SessionsPage = lazyWithRetry(() => import('../../features/teacher/pages/Sessions'));
const AgendaPage = lazyWithRetry(() => import('../../features/teacher/pages/Agenda'));
const ExamsPage = lazyWithRetry(() => import('../../features/teacher/pages/Exams'));
const AssignmentsPage = lazyWithRetry(() => import('../../features/teacher/pages/Assignments'));
const StudentsPage = lazyWithRetry(() => import('../../features/teacher/pages/Students'));
const ChatPage = lazyWithRetry(() => import('../../features/teacher/pages/Chat'));
const RequestsPage = lazyWithRetry(() => import('../../features/teacher/pages/Requests'));
const ViolationsPage = lazyWithRetry(() => import('../../features/teacher/pages/Violations'));
const DailyQuranPage = lazyWithRetry(() => import('../../features/teacher/pages/DailyQuran'))
export const teacherDashboardRoutes: RouteConfig[] = [
  {
    id: 'dashboard',
    label: 'sidebar_dashboard',
    icon: BarChart3,
    path: '',
    element: <DashboardOverview />,
  },
  {
    id: 'lms',
    label: 'sidebar_lms',
    icon: BookOpen,
    path: 'courses',
    element: <LMSCoursesPage />,
  },
  {
    id: 'academic-content',
    label: 'sidebar_academic_content',
    icon: FileText,
    path: 'content',
    subItems: [
      {
        id: 'sessions',
        label: 'sidebar_sessions',
        path: 'sessions',
        element: <SessionsPage />,
        icon: Play

      },
      {
        id: 'agenda',
        label: 'sidebar_agenda',
        path: 'agenda',
        element: <AgendaPage />,
        icon: Calendar,

      },
      {
        id: 'exams',
        label: 'sidebar_exams',
        path: 'exams',
        element: <ExamsPage />,
        icon: FileText,

      },

      {
        id:"daily-quran",
        label:"sidebar_daily_quran",
        path:"daily-quran",
        element:<DailyQuranPage />,
        icon: BookOpen,

      },
      {
        id: 'assignments',
        label: 'sidebar_assignments',
        path: 'assignments',
        element: <AssignmentsPage />,
        icon: ClipboardList,

      }
    ]
  },
  {
    id: 'teacher-students',
    label: 'sidebar_students',
    icon: Users,
    path: 'students',
    element: <StudentsPage />,
  },
  {
    id: 'teacher-chat',
    label: 'sidebar_chat',
    icon: MessageSquare,
    path: 'chat',
    element: <ChatPage />,
  },
  {
    id: 'teacher-requests',
    label: 'sidebar_requests',
    icon: Send,
    path: 'requests',
    element: <RequestsPage />,
  },

  {
    id: 'teacher-violations',
    label: 'sidebar_violations',
    icon: AlertTriangle,
    path: 'violations',
    element: <ViolationsPage />
  },

  {
    id: 'teacher-profile',
    label: 'sidebar_profile',
    icon: User,
    path: 'profile',
    element: <ProfilePage />,
  },
];
