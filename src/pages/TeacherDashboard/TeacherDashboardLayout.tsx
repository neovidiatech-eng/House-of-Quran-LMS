import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import TeacherSidebar from './TeacherSidebar';

interface TeacherDashboardLayoutProps {
  children: React.ReactNode;
}

export default function TeacherDashboardLayout({ children }: TeacherDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = i18n.language.split('-')[0] === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header
        userRole="teacher"
        userName="Teacher"
        userEmail="teacher@teacher.com"
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isCollapsed}
      />

      <div className="flex-1 flex overflow-hidden">
        <TeacherSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className={`flex-1 overflow-x-hidden overflow-y-auto w-full max-w-[100vw] transition-all duration-300 ${isRtl ? (isCollapsed ? 'lg:pr-20' : 'lg:pr-72') : (isCollapsed ? 'lg:pl-20' : 'lg:pl-72')}`}>
          <div className={`transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
