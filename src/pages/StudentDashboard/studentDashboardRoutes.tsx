import { ReactNode } from 'react';
import {
  Home,
  BookOpen,
  PlayCircle,
  Play,
  Calendar,
  FileText,
  ClipboardList,
  User,
  MessageSquare,
  Send
} from 'lucide-react';

export interface StudentRouteConfig {
  id: string;
  label: string;
  icon?: any;
  path: string;
  fullPath?: string;
  element?: ReactNode;
  subItems?: StudentRouteConfig[];
}

import { lazyWithRetry } from '../../utils/lazyWithRetry';

// --- Lazy Loading Page Components for Student from Features ---
const SessionsPage = lazyWithRetry(() => import('../../features/student/pages/Sessions'));
const AgendaPage = lazyWithRetry(() => import('../../features/student/pages/Agenda'));
const ExamsPage = lazyWithRetry(() => import('../../features/student/pages/Exams'));
const DailyQuranPage = lazyWithRetry(() => import('../../features/student/pages/DailyQuran'));
const AssignmentsPage = lazyWithRetry(() => import('../../features/student/pages/Assignments'));
const ProfilePage = lazyWithRetry(() => import('../../features/student/pages/Profile'));
const LMSCoursesPage = lazyWithRetry(() => import('../../features/student/pages/LMSCourses/LMSCourses'));
const ChatPage = lazyWithRetry(() => import('../../features/student/pages/Chat'));
const RequestsPage = lazyWithRetry(() => import('../../features/student/pages/Requests'));

export const studentDashboardRoutes: StudentRouteConfig[] = [
  {
    id: 'student-home',
    label: 'sidebar_dashboard',
    icon: Home,
    path: '',
  },
  {
    id: 'student-lms',
    label: 'sidebar_lms',
    icon: PlayCircle,
    path: 'lms',
    subItems: [
      {
        id: 'student-lms-courses',
        label: 'sidebar_courses',
        icon: Play,
        path: 'lms-courses',
        element: <LMSCoursesPage />,
      },
    ],
  },
  {
    id: 'student-content',
    label: 'sidebar_academic_content',
    icon: BookOpen,
    path: 'content',
    subItems: [
      {
        id: 'student-sessions',
        label: 'sidebar_sessions',
        icon: Play,
        path: 'sessions',
        element: <SessionsPage />,
      },
      {
        id: 'student-agenda',
        label: 'sidebar_agenda',
        icon: Calendar,
        path: 'agenda',
        element: <AgendaPage />,
      },
      {
        id: 'student-exams',
        label: 'sidebar_exams',
        icon: FileText,
        path: 'exams',
        element: <ExamsPage />,
      },
      {
        id: 'student-daily-quran',
        label: 'sidebar_daily_quran',
        icon: BookOpen,
        path: 'daily-quran',
        element: <DailyQuranPage />,
      },
      {
        id: 'student-assignments',
        label: 'sidebar_assignments',
        icon: ClipboardList,
        path: 'assignments',
        element: <AssignmentsPage />,
      },
    ],
  },
  {
    id: 'student-profile',
    label: 'sidebar_profile',
    icon: User,
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    id: 'student-chat',
    label: 'sidebar_chat',
    icon: MessageSquare,
    path: 'chat',
    element: <ChatPage />,
  },
  {
    id: 'student-requests',
    label: 'sidebar_requests',
    icon: Send,
    path: 'requests',
    element: <RequestsPage />,
  },
];
