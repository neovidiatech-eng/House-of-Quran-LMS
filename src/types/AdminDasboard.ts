export interface DashboardResponse {
  message: string;
  status: number;
  lang: string;
  data: DashboardData;
}

export interface DashboardData {
  stats: Stats;
  sessionsPerDay: SessionPerDay[];
  upcomingSessions: UpcomingSession[];
  activityFeed: ActivityFeedItem[];
  activeUsers: ActiveUsers;
}

export interface Stats {
  totalStudents: number;
  totalTeachers: number;
  pendingRequests: number;
  todaySessions: number;
}

export interface SessionPerDay {
  date: string;
  count: number;
}

export interface UpcomingSession {
  id: string;
  title: string;
  subject: string;
  time: string;
  teacher: string;
  student: string;
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  time: string;
  user: string;
  avatar: string | null;
}

export interface ActiveUsers {
  students: number;
  instructors: number;
}


export interface ActivityLogUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  confirmAt: string;
  roleId: string;
  code_country: string;
  status: 'active' | 'inactive' | 'blocked';
  googleId: string | null;
  provider: 'local' | 'google';
  timezone: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  action: string;
  role: string;
  createdAt: string;
  user: ActivityLogUser;
}

export interface ActivityLogsResponse {
  message: string;
  status: number;
  lang: 'ltr' | 'rtl';
  data: ActivityLogItem[];
}