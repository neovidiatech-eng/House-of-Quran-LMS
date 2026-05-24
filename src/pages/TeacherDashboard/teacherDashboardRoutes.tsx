import { lazy } from 'react';
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
  ClipboardList
} from 'lucide-react';
import { RouteConfig } from '../../components/constants/dashboardRoutes';

// Reuse dashboard components for content viewing
// Lazy Loading Page Components for Teacher from Features
const DashboardOverview = lazy(() => import('../../features/teacher/pages/Home'));
const ProfilePage = lazy(() => import('../../features/teacher/pages/Profile'));
const LMSCoursesPage = lazy(() => import('../../features/teacher/pages/LMSCourses/LMSCourses'));
const SessionsPage = lazy(() => import('../../features/teacher/pages/Sessions'));
const AgendaPage = lazy(() => import('../../features/teacher/pages/Agenda'));
const ExamsPage = lazy(() => import('../../features/teacher/pages/Exams'));
const AssignmentsPage = lazy(() => import('../../features/teacher/pages/Assignments'));
const StudentsPage = lazy(() => import('../../features/teacher/pages/Students'));
const ChatPage = lazy(() => import('../../features/teacher/pages/Chat'));
const RequestsPage = lazy(() => import('../../features/teacher/pages/Requests'));

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
    id: 'teacher-profile',
    label: 'sidebar_profile',
    icon: User,
    path: 'profile',
    element: <ProfilePage />,
  },
];
