import { useTranslation } from 'react-i18next';
import { useParentChildren } from '../hooks/useParentChildren';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, BookOpen, FileText, CheckSquare, Award, Mail, Globe, CalendarDays, User as UserIcon } from 'lucide-react';
import { useSettings } from '../../../contexts/SettingsContext';

export default function Children() {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isRtl = language === 'ar';
  const { settings } = useSettings();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useParentChildren();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isRtl ? 'أبنائي' : 'My Children'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <TableSkeleton rows={3} />
          <TableSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10 bg-red-50 rounded-2xl">
        {isRtl ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading data'}
      </div>
    );
  }

  const childrenData = data?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {isRtl ? 'أبنائي' : 'My Children'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRtl 
              ? `تصفح وتابع أداء وتفاصيل ${childrenData.length} من أبنائك` 
              : `Browse and track performance of your ${childrenData.length} children`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
        {childrenData.length > 0 ? (
          childrenData.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="bg-gray-50/50 rounded-[22px] p-6 h-full flex flex-col">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner transform group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {child.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1">{child.user.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {child.plan ? (isRtl ? child.plan.name_ar : child.plan.name_en) : (isRtl ? 'غير مشترك' : 'No Plan')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg font-semibold text-sm border border-yellow-100">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{child.avgRating || '0.0'}</span>
                    </div>
                    {child.active ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {isRtl ? 'نشط' : 'Active'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {isRtl ? 'غير نشط' : 'Inactive'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate" title={child.user.email}>{child.user.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span>{child.birth_date ? new Date(child.birth_date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>{child.gender === 'male' ? (isRtl ? 'ذكر' : 'Male') : child.gender === 'female' ? (isRtl ? 'أنثى' : 'Female') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{child.country || '-'}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-gray-400 text-xs mb-1 font-medium">{isRtl ? 'إجمالي الحصص' : 'Total'}</span>
                    <span className="text-xl font-bold text-gray-700">{child.sessions}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-emerald-600/80 text-xs mb-1 font-medium">{isRtl ? 'الحضور' : 'Attended'}</span>
                    <span className="text-xl font-bold text-emerald-700">{child.sessions_attended}</span>
                  </div>
                  <div className="bg-primary-50/50 p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-blue-600/80 text-xs mb-1 font-medium">{isRtl ? 'المتبقي' : 'Remaining'}</span>
                    <span className="text-xl font-bold text-blue-700">{child.sessions_remaining}</span>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/parent-dashboard/children/${child.id}/sessions`)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-primary-50 hover:text-blue-600 transition-all group/btn shadow-sm"
                  >
                    <div className="p-2 bg-primary-50 text-blue-500 rounded-lg group-hover/btn:bg-primary-100 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{isRtl ? 'الحصص' : 'Sessions'}</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/parent-dashboard/children/${child.id}/exams`)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 transition-all group/btn shadow-sm"
                  >
                    <div className="p-2 bg-purple-50 text-purple-500 rounded-lg group-hover/btn:bg-purple-100 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{isRtl ? 'الامتحانات' : 'Exams'}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/parent-dashboard/children/${child.id}/homeworks`)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all group/btn shadow-sm"
                  >
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg group-hover/btn:bg-orange-100 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{isRtl ? 'الواجبات' : 'Homework'}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/parent-dashboard/children/${child.id}/attendance`)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 transition-all group/btn shadow-sm"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover/btn:bg-emerald-100 transition-colors">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{isRtl ? 'الحضور' : 'Attendance'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{isRtl ? 'لا يوجد أبناء مضافين' : 'No children added'}</h3>
            <p className="text-gray-400 text-sm max-w-sm text-center">
              {isRtl ? 'لم يتم العثور على أي أبناء مرتبطين بحسابك بعد. يرجى مراجعة الإدارة.' : 'No children are linked to your account yet. Please contact administration.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
