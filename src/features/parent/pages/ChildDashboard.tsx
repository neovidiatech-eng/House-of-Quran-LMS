import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useParentChildren } from '../hooks/useParentChildren';
import { ArrowLeft, ArrowRight, Calendar, FileText, BookOpen, CheckSquare, User } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

import StudentSessionsTable from '../components/StudentSessionsTable';
import StudentExamsTable from '../components/StudentExamsTable';
import StudentHomeworksTable from '../components/StudentHomeworksTable';
import StudentAttendanceTable from '../components/StudentAttendanceTable';

export default function ChildDashboard() {
  const { studentId, tab } = useParams<{ studentId: string; tab: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const currentTab = tab || 'sessions';

  const { data: childrenResponse } = useParentChildren();
  const childrenData = Array.isArray(childrenResponse) ? childrenResponse : childrenResponse?.data || [];
  const currentChild = childrenData.find((c: any) => c.id === studentId);

  const tabs = [
    { id: 'sessions', label: isRtl ? 'الحصص' : 'Sessions', icon: Calendar },
    { id: 'exams', label: isRtl ? 'الامتحانات' : 'Exams', icon: FileText },
    { id: 'homeworks', label: isRtl ? 'الواجبات' : 'Homeworks', icon: BookOpen },
    { id: 'attendance', label: isRtl ? 'الحضور' : 'Attendance', icon: CheckSquare },
  ];

  if (!studentId) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/parent-dashboard/children"
            className="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary rounded-xl transition-colors"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shadow-inner">
              {currentChild?.user?.name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-900 leading-none">
                {currentChild?.user?.name || (isRtl ? 'تفاصيل الطالب' : 'Student Details')}
              </h1>
              <span className="text-sm text-gray-500 font-medium">
                {currentChild?.grade?.name || (isRtl ? 'طالب' : 'Student')}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Section integrated in header area for desktop */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {tabs.map((t) => {
            const isActive = currentTab === t.id;
            const Icon = t.icon;
            return (
              <Link
                key={t.id}
                to={`/parent-dashboard/children/${studentId}/${t.id}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {currentTab === 'sessions' && <StudentSessionsTable studentId={studentId} />}
        {currentTab === 'exams' && <StudentExamsTable studentId={studentId} />}
        {currentTab === 'homeworks' && <StudentHomeworksTable studentId={studentId} />}
        {currentTab === 'attendance' && <StudentAttendanceTable studentId={studentId} />}
      </div>
    </div>
  );
}
