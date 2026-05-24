export interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'teacher' | 'student';
  userName?: string;
  userEmail?: string;
}