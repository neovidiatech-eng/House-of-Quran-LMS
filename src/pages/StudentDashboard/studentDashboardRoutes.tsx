import { lazy, ReactNode } from 'react';
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

// --- Lazy Loading Page Components for Student from Features ---
const SessionsPage = lazy(() => import('../../features/student/pages/Sessions'));
const AgendaPage = lazy(() => import('../../features/student/pages/Agenda'));
const ExamsPage = lazy(() => import('../../features/student/pages/Exams'));
const AssignmentsPage = lazy(() => import('../../features/student/pages/Assignments'));
const ProfilePage = lazy(() => import('../../features/student/pages/Profile'));
const LMSCoursesPage = lazy(() => import('../../features/student/pages/LMSCourses/LMSCourses'));
const ChatPage = lazy(() => import('../../features/student/pages/Chat'));
const RequestsPage = lazy(() => import('../../features/student/pages/Requests'));

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
