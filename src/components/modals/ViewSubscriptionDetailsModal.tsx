import { X, User, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSessions } from '../../contexts/SessionsContext';

interface ViewSubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    id: string;
    studentName: string;
    email: string;
    phone: string;
    country: string;
    gender: string;
    planName: string;
    planPrice: string;
    currencyName: string;
    startDate: string;
    paidAt: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    sessionsRemaining: number;
    totalSessions: number;
    attendedSessions: number;
    avgRating: number;
    totalReviews: number;
    sessionTime: number;
  };
}

export default function ViewSubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription
}: ViewSubscriptionDetailsModalProps) {
  const { language } = useLanguage();
  const { sessions: allSessions } = useSessions();

  const text = {
    title: { ar: 'تفاصيل الاشتراك', en: 'Subscription Details' },
    studentInfo: { ar: 'معلومات الطالب', en: 'Student Information' },
    studentName: { ar: 'اسم الطالب', en: 'Student Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    phone: { ar: 'رقم الهاتف', en: 'Phone' },
    country: { ar: 'الدولة', en: 'Country' },
    gender: { ar: 'النوع', en: 'Gender' },
    planDetails: { ar: 'تفاصيل الباقة', en: 'Plan Details' },
    planName: { ar: 'اسم الباقة', en: 'Plan Name' },
    price: { ar: 'السعر', en: 'Price' },
    currency: { ar: 'العملة', en: 'Currency' },
    startDate: { ar: 'تاريخ البدء', en: 'Start Date' },
    paidAt: { ar: 'تاريخ الدفع', en: 'Paid At' },
    endDate: { ar: 'تاريخ الانتهاء', en: 'End Date' },
    status: { ar: 'الحالة', en: 'Status' },
    active: { ar: 'نشط', en: 'Active' },
    expired: { ar: 'منتهي', en: 'Expired' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    sessionsInfo: { ar: 'معلومات الحصص', en: 'Sessions Information' },
    totalSessions: { ar: 'إجمالي الحصص', en: 'Total Sessions' },
    completedSessions: { ar: 'الحصص المكتملة', en: 'Completed Sessions' },
    remainingSessions: { ar: 'الحصص المتبقية', en: 'Remaining Sessions' },
    scheduledSoon: { ar: 'مجدولة قريبًا', en: 'Scheduled Soon' },
    sessionTime: { ar: 'مدة الحصة', en: 'Session Time' },
    rating: { ar: 'التقييم', en: 'Rating' },
    reviews: { ar: 'عدد التقييمات', en: 'Reviews' },
    teacherInfo: { ar: 'معلومات المعلم', en: 'Teacher Information' },
    teacher: { ar: 'المعلم', en: 'Teacher' },
    subject: { ar: 'المادة', en: 'Subject' },
    sessionsSchedule: { ar: 'جدول الحصص', en: 'Sessions Schedule' },
    completed: { ar: 'مكتملة', en: 'Completed' },
    upcoming: { ar: 'قادمة', en: 'Upcoming' },
    date: { ar: 'التاريخ', en: 'Date' },
    time: { ar: 'الوقت', en: 'Time' },
    noSessions: { ar: 'لا توجد حصص', en: 'No sessions found' },
    close: { ar: 'إغلاق', en: 'Close' }
  };

  if (!isOpen) return null;

  const studentSessions = allSessions.filter(
    session => session.studentName === subscription.studentName
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedSessions = studentSessions.filter(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate < today;
  });

  const upcomingSessions = studentSessions.filter(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  });


  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-primary-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.studentInfo[language]}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.studentName[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.phone[language]}</p>
                <p className="text-base font-semibold text-gray-900" dir="ltr">{subscription.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.email[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.country[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.gender[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.gender}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{text.planDetails[language]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.planName[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.price[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.planPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.currency[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.currencyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.startDate[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.paidAt[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.paidAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.sessionTime[language]}</p>
                <p className="text-base font-semibold text-gray-900">{subscription.sessionTime} {language === 'ar' ? 'دقيقة' : 'min'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{text.status[language]}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(subscription.status)}`}>
                  {text[subscription.status][language]}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{text.sessionsInfo[language]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">{text.totalSessions[language]}</p>
                <p className="text-2xl font-bold text-purple-600">{subscription.totalSessions}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">{text.completedSessions[language]}</p>
                <p className="text-2xl font-bold text-green-600">{subscription.attendedSessions}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">{text.remainingSessions[language]}</p>
                <p className="text-2xl font-bold text-blue-600">{subscription.sessionsRemaining}</p>
              </div>
               <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">{text.scheduledSoon[language]}</p>
                <p className="text-2xl font-bold text-blue-600">{subscription.totalSessions - subscription.sessionsRemaining}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">{text.rating[language]}</p>
                <p className="text-2xl font-bold text-yellow-600">{subscription.avgRating}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">{text.reviews[language]}</p>
                <p className="text-2xl font-bold text-gray-700">{subscription.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{text.sessionsSchedule[language]}</h3>

            {completedSessions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="text-base font-semibold text-gray-900">{text.completed[language]}</h4>
                  <span className="text-sm text-gray-600">({completedSessions.length})</span>
                </div>
                <div className="space-y-2 max-h-64  overflow-y-auto no-scrollbar">
                  {completedSessions.map(session => (
                    <div key={session.id} className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{session.sessionName}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingSessions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <h4 className="text-base font-semibold text-gray-900">{text.upcoming[language]}</h4>
                  <span className="text-sm text-gray-600">({upcomingSessions.length})</span>
                </div>
                <div className="space-y-2 max-h-64  overflow-y-auto no-scrollbar">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="bg-primary-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{session.sessionName}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {studentSessions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{text.noSessions[language]}</p>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {text.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
