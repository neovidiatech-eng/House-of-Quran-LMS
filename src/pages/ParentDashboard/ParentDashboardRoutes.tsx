import { ReactNode } from 'react';
import {
  Play,
  FileText,
  ClipboardList,
  Users
} from 'lucide-react';

export interface ParentRouteConfig {
  id: string;
  label: string;
  icon?: any;
  path: string;
  fullPath?: string;
  element?: ReactNode;
  subItems?: ParentRouteConfig[];
}

import { lazyWithRetry } from '../../utils/lazyWithRetry';

// --- Lazy Loading Page Components for Student from Features ---
const SessionsPage = lazyWithRetry(() => import('../../features/parent/pages/Sessions'));
const ExamsPage = lazyWithRetry(() => import('../../features/parent/pages/Exams'));
const AssignmentsPage = lazyWithRetry(() => import('../../features/parent/pages/Assignments'));
const ChildrenPage = lazyWithRetry(() => import('../../features/parent/pages/Children'));
const ChildDashboard = lazyWithRetry(() => import('../../features/parent/pages/ChildDashboard'));

export const parentDashboardRoutes: ParentRouteConfig[] = [
      {
        id: 'parent-children',
        label: 'sidebar_my_children',
        icon: Users,
        path: 'children',
        element: <ChildrenPage />,
      },
      {
        id: 'child-dashboard',
        label: 'sidebar_student_dashboard',
        path: 'children/:studentId/:tab',
        element: <ChildDashboard />,
      },
      {
        id: 'student-sessions',
        label: 'sidebar_sessions',
        icon: Play,
        path: 'sessions',
        element: <SessionsPage />,
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
    ]
