import { useState } from 'react';
import Header from '../../components/layout/Header';
import { useLanguage } from '../../contexts/LanguageContext';
interface StudentDashboardLayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'teacher' | 'student' | 'parent';
  userName?: string;
  userEmail?: string;
}

export default function StudentDashboardLayout({
  children,
  userRole = 'parent',
  userName = 'ولي الأمر',
  userEmail = 'parent@parent.com',
}: StudentDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language } = useLanguage();

  const isRtl = language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        isCollapsed={true}
      />

      <main className="w-full transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 w-full mx-auto max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
