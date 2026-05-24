import { lazy, ReactNode } from "react";
import {
  Home,
  Users,
  BookOpen,
  DollarSign,
  PlayCircle,
  Settings,
  CreditCard,
  GraduationCap,
  Play,
  UserCheck,
  FileQuestion,
  Clock,
  Book,
  Calendar,
  FileText,
  ClipboardList,
  AlertCircle,
  Layers,
  Package,
  Coins,
  ShieldCheck,
  Repeat
} from 'lucide-react';
import Roles from '../../features/admin/pages/Roles';

export interface RouteConfig {
  id: string;
  label: string;
  icon?: any;
  path: string; // The relative path for routing
  fullPath?: string; // Optional for Sidebar grouping cases
  element?: ReactNode;
  subItems?: RouteConfig[];
}

// --- Lazy Loading Page Components ---
const UsersPage = lazy(() => import("../../features/admin/pages/Users"));
const StudentsPage = lazy(() => import("../../features/admin/pages/Students"));
const TeachersPage = lazy(() => import("../../features/admin/pages/Teachers"));
const ParentsPage = lazy(() => import("../../features/admin/pages/Parents"));
const SessionsPage = lazy(() => import("../../features/admin/pages/Sessions"));
const AgendaPage = lazy(() => import("../../features/admin/pages/Agenda"));
const ExamsPage = lazy(() => import("../../features/admin/pages/Exams"));
const AssignmentsPage = lazy(() => import("../../features/admin/pages/Assignments"));
const SubscriptionRequestsPage = lazy(
  () => import("../../features/admin/pages/SubscriptionRequests"),
);
const AllSubscriptionsPage = lazy(() => import("../../features/admin/pages/AllSubscriptions"));
const PlansPage = lazy(() => import("../../features/admin/pages/Plans"));
const CurrenciesPage = lazy(() => import("../../features/admin/pages/Currencies"));
const ExpensesPage = lazy(() => import("../../features/admin/pages/Expenses"));
const TransactionsPage = lazy(() => import("../../features/admin/pages/Transactions"));
const TeacherRequestsPage = lazy(() => import("../../features/admin/pages/TeacherRequests"));
const TeacherAvailabilityPage = lazy(
  () => import("../../features/admin/pages/TeacherAvailability"),
);
const SubjectsPage = lazy(() => import("../../features/admin/pages/Subjects"));
const LMSCoursesPage = lazy(() => import("../../features/admin/pages/LMSCourses/LMSCourses"));
const SettingsPage = lazy(() => import("../../features/admin/pages/Settings"));

export const dashboardRoutes: RouteConfig[] = [
  {
    id: "dashboard",
    label: "sidebar_dashboard",
    icon: Home,
    path: "",
  },
  {
    id: "lms",
    label: "sidebar_lms",
    icon: PlayCircle,
    path: "lms",
    subItems: [
      {
        id: "lms-courses",
        label: "sidebar_courses",
        icon: Play,
        path: "lms-courses",
        element: <LMSCoursesPage />,
      },
    ],
  },
  {
    id: "users",
    label: "sidebar_user_management",
    icon: Users,
    path: "users",
    subItems: [
      {
        id: "admins",
        label: "sidebar_admins",
        icon: UserCheck,
        path: "admins",
        element: <UsersPage />,
      },
      {
        id: "students",
        label: "sidebar_students",
        icon: GraduationCap,
        path: "students",
        element: <StudentsPage />,
      },
      {
        id: "parents",
        label: "sidebar_parents",
        icon: Users,
        path: "parents",
        element: <ParentsPage />,
      },
    ],
  },
  {
    id: "teachers-section",
    label: "sidebar_teachers",
    icon: GraduationCap,
    path: "teachers-group",
    subItems: [
      {
        id: "teachers",
        label: "sidebar_teachers",
        icon: GraduationCap,
        path: "teachers",
        element: <TeachersPage />,
      },
      {
        id: "requests",
        label: "sidebar_requests",
        icon: FileQuestion,
        path: " requests",
        element: <TeacherRequestsPage />,
      },
      {
        id: "teacher-availability",
        label: "sidebar_available",
        icon: Clock,
        path: "teacher-availability",
        element: <TeacherAvailabilityPage />,
      },
      {
        id: "subjects",
        label: "sidebar_subjects",
        icon: Book,
        path: "subjects",
        element: <SubjectsPage />,
      },
    ],
  },
  {
    id: "content",
    label: "sidebar_academic_content",
    icon: BookOpen,
    path: "content",
    subItems: [
      {
        id: "sessions",
        label: "sidebar_sessions",
        icon: Play,
        path: "sessions",
        element: <SessionsPage />,
      },
      {
        id: "agenda",
        label: "sidebar_agenda",
        icon: Calendar,
        path: "agenda",
        element: <AgendaPage />,
      },
      {
        id: "exams",
        label: "sidebar_exams",
        icon: FileText,
        path: "exams",
        element: <ExamsPage />,
      },
      {
        id: "assignments",
        label: "sidebar_assignments",
        icon: ClipboardList,
        path: "assignments",
        element: <AssignmentsPage />,
      },
    ],
  },
  {
    id: "subscriptions",
    label: "sidebar_subscription_requests",
    icon: CreditCard,
    path: "subscriptions-group",
    subItems: [
      {
        id: "subscription-requests",
        label: "sidebar_subscription_requests",
        icon: AlertCircle,
        path: "subscription-requests",
        element: <SubscriptionRequestsPage />,
      },
      {
        id: "all-subscriptions",
        label: "sidebar_all_subscriptions",
        icon: Layers,
        path: "all-subscriptions",
        element: <AllSubscriptionsPage />,
      },
      {
        id: "plans",
        label: "sidebar_plans",
        icon: Package,
        path: "plans",
        element: <PlansPage />,
      },
    ],
  },

  {
    id: 'roles',
    label: 'sidebar_roles',
    icon: ShieldCheck,
    path: 'roles',
    element: <Roles />
  },
  {
    id: "finance",
    label: "sidebar_finance",
    icon: DollarSign,
    path: "finance-group",
    subItems: [
      {
        id: "currencies",
        label: "sidebar_currencies",
        icon: Coins,
        path: "currencies",
        element: <CurrenciesPage />,
      },
      {
        id: "expenses",
        label: "sidebar_expenses",
        icon: CreditCard,
        path: "expenses",
        element: <ExpensesPage />,
      },
      {
        id: "transactions",
        label: "sidebar_transactions",
        icon: Repeat,
        path: "transactions",
        element: <TransactionsPage />,
      },
    ],
  },
  {
    id: "settings",
    label: "sidebar_settings",
    icon: Settings,
    path: "settings",
    element: <SettingsPage />,
  },
];
