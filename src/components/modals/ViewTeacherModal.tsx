import { X, Phone, Mail, GraduationCap, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSessions } from '../../contexts/SessionsContext';
import { Teacher } from '../../types/teachers';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { Currency } from '../../types/currency';
import { useTeacherById } from '../../features/admin/hooks/useTeacher';

interface ViewTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export default function ViewTeacherModal({ isOpen, onClose, teacher }: ViewTeacherModalProps) {
  const { language, t } = useLanguage();
  const { sessions } = useSessions();
  const { data: currenciesData } = useCurrency();
  const { data: fetchedTeacher, isLoading } = useTeacherById(isOpen && teacher ? teacher.id : undefined);

  if (!isOpen || !teacher) return null;

  const activeTeacher = fetchedTeacher || teacher;

  const teacherSessions = sessions.filter(s => s.teacherName === activeTeacher.user?.name);
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = teacherSessions.filter(s => s.date === today);
  const upcomingSessions = teacherSessions.filter(s => s.date >= today);
  const completedSessions = teacherSessions.filter(s => s.date < today);
  const uniqueStudents = [...new Set(teacherSessions.map(s => s.studentName))];

  const calcSessionHours = (session: { time: string; endTime: string }) => {
    const parseTime = (timeStr: string) => {
      const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return 0;
      let h = parseInt(m[1]);
      const min = parseInt(m[2]);
      const p = m[3].toUpperCase();
      if (p === 'PM' && h !== 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;
      return h + min / 60;
    };
    return Math.max(0, parseTime(session.endTime) - parseTime(session.time));
  };

  const totalHours = teacherSessions.reduce((sum, s) => sum + calcSessionHours(s), 0);
  const completedHours = completedSessions.reduce((sum, s) => sum + calcSessionHours(s), 0);
  const pendingHours = upcomingSessions.reduce((sum, s) => sum + calcSessionHours(s), 0);

  const hourPrice = activeTeacher.hour_price || 0;
  const totalEarnings = completedHours * hourPrice;
  const pendingEarnings = pendingHours * hourPrice;
  const totalOwed = totalHours * hourPrice;

  const currencies = currenciesData?.currencies || [];
  const teacherCurrency = currencies.find(
    (c: Currency) => c.id === activeTeacher.currencyId
  );
  const currencySymbol = teacherCurrency?.symbol || teacherCurrency?.code || 'EGP';
  // Safe subject extraction
  const subjects = (activeTeacher.teacherSubjects || []).map((s: any) => {
    if (s.subject) {
      return s.subject.name_ar || s.subject.name_en || s.subject.name || '';
    }
    return '';
  }).filter(Boolean);

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10" >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{activeTeacher.user?.name}</h2>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" title={t('loading') || 'Loading...'} />
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeTeacher.user?.name}</h3>

            <div className="flex items-center gap-4 mb-4 flex-wrap justify-center">
              <a href={`tel:${activeTeacher.user?.code_country}${activeTeacher.user?.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{activeTeacher.user?.code_country} {activeTeacher.user?.phone}</span>
              </a>
              <a href={`mailto:${activeTeacher.user?.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{activeTeacher.user?.email}</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {subjects.map((sub, index) => (
                <span key={index} className="inline-flex px-3 py-1 bg-primary-100 text-blue-700 rounded-lg text-sm font-medium">
                  {sub}
                </span>
              ))}
            </div>

            <div className="flex gap-4 items-center flex-wrap justify-center">
              <div className={`rounded-xl px-6 py-3 text-center border ${activeTeacher.active ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-xs text-gray-500 mb-1">{t('status')}</p>
                <p className={`text-lg font-bold ${activeTeacher.active ? 'text-green-700' : 'text-gray-600'}`}>
                  {activeTeacher.active ? t('active') : t('inactive')}
                </p>
              </div>
              <div className="bg-primary-50 rounded-xl px-6 py-3 text-center border border-blue-100">
                <p className="text-xs text-blue-600 mb-1">{t('hourlyRate') || (language === 'ar' ? 'السعر بالساعة' : 'Hourly Rate')}</p>
                <p className="text-lg font-bold text-blue-700">{hourPrice.toFixed(2)} {currencySymbol}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 justify-start">
              <h4 className="text-lg font-bold text-gray-900">{t('statistics') || (language === 'ar' ? 'الإحصائيات' : 'Statistics')}</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-2 rounded-lg bg-primary-50 w-fit mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1 text-start">{t('students') || (language === 'ar' ? 'عدد الطلاب' : 'Students')}</p>
                <p className="text-2xl font-bold text-gray-900 text-start">{uniqueStudents.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-2 rounded-lg bg-orange-50 w-fit mb-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1 text-start">{t('todaySessions') || (language === 'ar' ? 'حصص اليوم' : "Today's Sessions")}</p>
                <p className="text-2xl font-bold text-gray-900 text-start">{todaySessions.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-2 rounded-lg bg-green-50 w-fit mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1 text-start">{t('completedSessions') || (language === 'ar' ? 'حصص مكتملة' : 'Completed')}</p>
                <p className="text-2xl font-bold text-gray-900 text-start">{completedSessions.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-2 rounded-lg bg-yellow-50 w-fit mb-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1 text-start">{t('upcomingSessions') || (language === 'ar' ? 'حصص قادمة' : 'Upcoming')}</p>
                <p className="text-2xl font-bold text-gray-900 text-start">{upcomingSessions.length}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 justify-start">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-bold text-gray-900">{t('earningsDetails') || (language === 'ar' ? 'تفاصيل الأرباح' : 'Earnings Details')}</h4>
            </div>

            <div className="bg-primary-50 border border-blue-200 rounded-xl p-4 mb-4 text-start">
              <p className="text-xs text-blue-700 font-semibold mb-1">{t('formula') || (language === 'ar' ? 'المعادلة الحسابية' : 'Formula')}</p>
              <p className="text-sm text-blue-800 font-mono">
                {language === 'ar'
                  ? `الأرباح = عدد الساعات × ${hourPrice} ${currencySymbol}/ساعة`
                  : `Earnings = Hours × ${hourPrice} ${currencySymbol}/hour`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl p-5 bg-primary-50 text-blue-700">
                <p className="text-sm mb-2 text-start opacity-80">{t('totalHours') || (language === 'ar' ? 'إجمالي الساعات' : 'Total Hours')}</p>
                <p className="text-2xl font-bold text-start">{totalHours.toFixed(1)} {language === 'ar' ? 'ساعة' : 'hrs'}</p>
              </div>
              <div className="rounded-xl p-5 bg-white text-gray-900 border border-gray-200">
                <p className="text-sm mb-2 text-start opacity-80">{t('ratePerHour') || (language === 'ar' ? 'السعر / ساعة' : 'Rate / Hour')}</p>
                <p className="text-2xl font-bold text-start">{hourPrice.toFixed(2)} {currencySymbol}</p>
              </div>
              <div className="rounded-xl p-5 bg-green-50 text-green-700">
                <p className="text-sm mb-2 text-start opacity-80">{t('totalOwed') || (language === 'ar' ? 'إجمالي المستحق' : 'Total Owed')}</p>
                <p className="text-2xl font-bold text-start">{totalOwed.toFixed(2)} {currencySymbol}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl p-5 bg-green-50 text-green-700">
                <p className="text-sm mb-2 text-start opacity-80">{t('completedEarnings') || (language === 'ar' ? 'أرباح الحصص المكتملة' : 'Completed Earnings')}</p>
                <p className="text-2xl font-bold text-start">{totalEarnings.toFixed(2)} {currencySymbol}</p>
                <p className="text-xs opacity-60 text-start mt-1">{completedHours.toFixed(1)} {language === 'ar' ? 'ساعة' : 'hrs'}</p>
              </div>
              <div className="rounded-xl p-5 bg-orange-50 text-orange-700">
                <p className="text-sm mb-2 text-start opacity-80">{t('pendingEarnings') || (language === 'ar' ? 'أرباح معلقة' : 'Pending Earnings')}</p>
                <p className="text-2xl font-bold text-start">{pendingEarnings.toFixed(2)} {currencySymbol}</p>
                <p className="text-xs opacity-60 text-start mt-1">{pendingHours.toFixed(1)} {language === 'ar' ? 'ساعة' : 'hrs'}</p>
              </div>
              <div className="rounded-xl p-5 bg-gray-50 text-gray-700 border border-gray-200">
                <p className="text-sm mb-2 text-start opacity-80">{t('availableForWithdrawal') || (language === 'ar' ? 'رصيد متاح للسحب' : 'Available for Withdrawal')}</p>
                <p className="text-2xl font-bold text-start">{totalEarnings.toFixed(2)} {currencySymbol}</p>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-red-50 text-red-700">
              <p className="text-sm mb-2 text-start opacity-80">{t('pendingWithdrawalRequests') || (language === 'ar' ? 'طلبات سحب معلقة' : 'Pending Withdrawal Requests')}</p>
              <p className="text-2xl font-bold text-start">0.00 {currencySymbol}</p>
            </div>
          </div>

          {teacherSessions.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4 justify-start">
                <h4 className="text-lg font-bold text-gray-900">{t('recentSessions') || (language === 'ar' ? 'آخر الحصص' : 'Recent Sessions')}</h4>
              </div>
              <div className="space-y-2">
                {teacherSessions.slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${session.date < today ? 'bg-green-400' : session.date === today ? 'bg-primary-400' : 'bg-yellow-400'}`} />
                      <span className="text-xs text-gray-500">{session.time} - {session.endTime}</span>
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-medium text-gray-900">{session.studentName}</p>
                      <p className="text-xs text-gray-400">{session.date} · {session.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <button onClick={onClose} className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl transition-colors font-medium">
            {t('close') || (language === 'ar' ? 'إغلاق' : 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
