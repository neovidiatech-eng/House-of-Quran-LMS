import {
  Users,
  BookOpen,
  PlayCircle,
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
  Trophy,
  MessageSquare,
  ShieldAlert,
  DollarSign,
  Coins,
  Repeat
} from 'lucide-react';

export interface RouteConfig {
  id: string;
  label: string;
  icon?: any;
  path: string;
  subItems?: RouteConfig[];
}

export const supervisorDashboardRoutes: RouteConfig[] = [
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
        path: "courses",
      },
    ],
  },
  {
    id: "users",
    label: "sidebar_user_management",
    icon: Users,
    path: "users-group",
    subItems: [
      {
        id: "admins",
        label: "sidebar_admins",
        icon: UserCheck,
        path: "admins",
      },
      {
        id: "students",
        label: "sidebar_students",
        icon: GraduationCap,
        path: "students",
      },
      {
        id: "ranks",
        label: "sidebar_ranks",
        icon: Trophy,
        path: "ranks",
      },
      {
        id: "parents",
        label: "sidebar_parents",
        icon: Users,
        path: "parents",
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
      },
      {
        id: "teacher-availability",
        label: "sidebar_available",
        icon: Clock,
        path: "teacher-availability",
      },
      {
        id: "subjects",
        label: "sidebar_subjects",
        icon: Book,
        path: "subjects",
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
      },
      {
        id: "agenda",
        label: "sidebar_agenda",
        icon: Calendar,
        path: "agenda",
      },
      {
        id: "feedback",
        label: "sidebar_feedback",
        icon: MessageSquare,
        path: "feedback",
      },
      {
        id: "exams",
        label: "sidebar_exams",
        icon: FileText,
        path: "exams",
      },
      {
        id: "daily-quran",
        label: "sidebar_daily_quran",
        icon: BookOpen,
        path: "daily-quran",
      },
      {
        id: "assignments",
        label: "sidebar_assignments",
        icon: ClipboardList,
        path: "homework", // keeping the old path homework, or change to assignments? Let's keep it 'homework' to match previous routes.
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
      },
      {
        id: "teacher-subscriptions",
        label: "sidebar_teacher_subscriptions",
        icon: UserCheck,
        path: "teacher-subscriptions",
      },
      {
        id: "all-subscriptions",
        label: "sidebar_all_subscriptions",
        icon: Layers,
        path: "all-subscriptions",
      },
      {
        id: "plans",
        label: "sidebar_plans",
        icon: Package,
        path: "plans",
      },
    ],
  },
  {
    id: "requests",
    label: "sidebar_requests",
    icon: FileQuestion,
    path: "requests",
  },

  {
    id: "violations",
    label: "sidebar_violations",
    icon: ShieldAlert,
    path: "violations",
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
      },
      {
        id: "expenses",
        label: "sidebar_expenses",
        icon: CreditCard,
        path: "expenses",
      },
      {
        id: "transactions",
        label: "sidebar_transactions",
        icon: Repeat,
        path: "transactions",
      },
    ],
  }
];
