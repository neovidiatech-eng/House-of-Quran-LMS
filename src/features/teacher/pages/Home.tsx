import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Clock, Calendar, Video } from 'lucide-react';
import { Spin } from 'antd';
import { useSettings } from '../../../contexts/SettingsContext';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { useTeacherProfile } from '../hooks/useTeacherProfile';

export default function TeacherDashboardHome() {
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const isRtl = i18n.language.split('-')[0] === 'ar';
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');

  const { data: dashboardResponse, isLoading: isDashboardLoading, error: dashboardError } = useTeacherDashboard();
  const { data: profileResponse, isLoading: isProfileLoading } = useTeacherProfile();

  if (isDashboardLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (dashboardError || !dashboardResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        {isRtl ? 'حدث خطأ أثناء تحميل لوحة التحكم' : 'Error loading dashboard data'}
      </div>
    );
  }

  const dashboardData = dashboardResponse.data;
  const teacherName = profileResponse?.data?.teacher?.name || '';

  const stats = [
    {
      title: isRtl ? 'الطلاب' : 'Students',
      value: dashboardData.stats.totalStudents.toString(),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-primary-50'
    },
    {
      title: isRtl ? 'المواد' : 'Subjects',
      value: dashboardData.stats.totalSubjects.toString(),
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      title: isRtl ? 'إجمالي الحصص' : 'Total Sessions',
      value: dashboardData.stats.totalSessions.toString(),
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    {
      title: isRtl ? 'حصص اليوم' : 'Today Sessions',
      value: dashboardData.todaySchedules.length.toString(),
      icon: Calendar,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
  ];

  const formatSessionTime = (startTimeStr: string, endTimeStr: string) => {
    try {
      const start = new Date(startTimeStr);
      const end = new Date(endTimeStr);
      const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      const locale = isRtl ? 'ar-EG' : 'en-US';
      return `${start.toLocaleTimeString(locale, options)} - ${end.toLocaleTimeString(locale, options)}`;
    } catch (e) {
      return '';
    }
  };

  const formatSessionDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(date);
    } catch (e) {
      return '';
    }
  };
  interface NormalizedSchedule {
    title: string;
    description: string;
    status: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    link: string;
    notes: string;
    subject: {
      nameEn: string;
      nameAr: string;
      color: string;
    };
    student: {
      name: string;
      email?: string;
    };
  }

  const normalizedTodaySchedules: NormalizedSchedule[] = (dashboardData.todaySchedules || []).map((todayItem: any) => {
    const student = (dashboardData.students || []).find(s => s.id === todayItem.studentId);
    let matchedSubject = (dashboardData.subjects || []).find(sub => 
      student && (sub.nameEn.toLowerCase() === student.subject?.name?.toLowerCase() || 
                  sub.nameAr === student.subject?.name)
    );
    
    if (!matchedSubject && (dashboardData.subjects || []).length > 0) {
      matchedSubject = dashboardData.subjects[0];
    }
    
    return {
      title: todayItem.title || todayItem.description || '',
      description: todayItem.description || '',
      status: todayItem.status || 'scheduled',
      startTime: todayItem.start_time || todayItem.startTime || '',
      endTime: todayItem.end_time || todayItem.endTime || '',
      isRecurring: todayItem.is_recurring ?? todayItem.is_recurring ?? false,
      link: todayItem.link || '',
      notes: todayItem.notes || '',
      subject: {
        nameEn: matchedSubject?.nameEn || student?.subject?.name || 'Subject',
        nameAr: matchedSubject?.nameAr || student?.subject?.name || 'المادة',
        color: matchedSubject?.color || '#3b82f6',
      },
      student: {
        name: student?.name || 'Student',
        email: student?.email || '',
      }
    };
  });

  const normalizedUpcomingSchedules: NormalizedSchedule[] = (dashboardData.schedules || []).map((item: any) => {
    return {
      title: item.title || '',
      description: item.description || '',
      status: item.status || 'scheduled',
      startTime: item.startTime || item.start_time || '',
      endTime: item.endTime || item.end_time || '',
      isRecurring: item.isRecurring ?? item.is_recurring ?? false,
      link: item.link || '',
      notes: item.notes || '',
      subject: {
        nameEn: item.subject?.nameEn || 'Subject',
        nameAr: item.subject?.nameAr || 'المادة',
        color: item.subject?.color || '#3b82f6',
      },
      student: {
        name: item.student?.name || 'Student',
        email: item.student?.email || '',
      }
    };
  });

  const currentSchedules = activeTab === 'today' ? normalizedTodaySchedules : normalizedUpcomingSchedules;

  return (
    <div className="space-y-6 animate-fade-in pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Welcome Banner */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden shadow-sm" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.accentColor})` }}>
        <h1 className='text-2xl font-bold text-white'>
          {isRtl ? `أهلاً بك! ${teacherName}` : `Welcome! ${teacherName}`}
        </h1>
        <div className="flex items-center gap-2 text-white mt-1">
          <Calendar size={16} />
          <span className="text-sm">
            {new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }).format(new Date())}
          </span>
        </div>
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-10 -mt-10 opacity-10"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Layout: Schedules (left/main) and Students (right/side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedules Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          {/* Tabs header */}
          <div className="flex border-b border-gray-100 mb-6 gap-6">
            <button
              onClick={() => setActiveTab('today')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'today'
                  ? 'text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'today' ? { borderColor: settings.primaryColor, color: settings.primaryColor } : {}}
            >
              {isRtl ? 'جدول اليوم' : "Today's Schedule"} ({dashboardData.todaySchedules.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'upcoming'
                  ? 'text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'upcoming' ? { borderColor: settings.primaryColor, color: settings.primaryColor } : {}}
            >
              {isRtl ? 'الجدول القادم' : 'Upcoming Schedule'} ({dashboardData.schedules.length})
            </button>
          </div>

          {/* Schedule list */}
          <div className="space-y-4 flex-grow">
            {currentSchedules.length > 0 ? (
              currentSchedules.map((session, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-lg" style={{ color: settings.primaryColor }}>
                      {session.student.name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-start">{session.student.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block" 
                          style={{ backgroundColor: session.subject.color || settings.primaryColor }}
                        />
                        <span className="text-xs text-gray-500">
                          {isRtl ? session.subject.nameAr : session.subject.nameEn}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                      <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700">
                        {formatSessionDate(session.startTime)}
                      </span>
                      <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700">
                        {formatSessionTime(session.startTime, session.endTime)}
                      </span>
                    </div>
                   
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {activeTab === 'today' 
                    ? (isRtl ? 'لا توجد حصص مجدولة اليوم' : 'No sessions scheduled for today') 
                    : (isRtl ? 'لا توجد حصص مجدولة قادمة' : 'No upcoming sessions scheduled')
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Students Column */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: settings.primaryColor }} />
            {isRtl ? 'طلابي' : 'My Students'}
          </h2>
          <div className="space-y-4">
            {dashboardData.students.length > 0 ? (
              dashboardData.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-sm" style={{ color: settings.primaryColor }}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="text-start">
                      <h4 className="font-bold text-sm text-gray-900">{student.name}</h4>
                      <p className="text-xs text-gray-500">{student.subject.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
                      {student.sessions}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">
                  {isRtl ? 'لا يوجد طلاب مسجلين' : 'No students registered'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
