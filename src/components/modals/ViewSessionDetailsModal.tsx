import { X, Calendar, Clock, User, BookOpen, GraduationCap, Edit, Video } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SessionGroup {
  id: string;
  sessionName: string;
  student: string;
  teacher: string;
  subject: string;
  monthYear: string;
  duration: number;
  meetingLink: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }>;
  packageInfo: {
    packageName: string;
    totalSessions: number;
    sessionsUsed: number;
    sessionsRemaining: number;
  };
}

interface ViewSessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionGroup: SessionGroup | null;
  onEditSession?: (sessionId: string, sessionIndex: number) => void;
  onJoinSession?: (sessionId: string, sessionIndex: number) => void;
  readOnly?: boolean;
}

export default function ViewSessionDetailsModal({ isOpen, onClose, sessionGroup, onEditSession, onJoinSession, readOnly }: ViewSessionDetailsModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'تفاصيل الحصص', en: 'Session Details' },
    sessionName: { ar: 'اسم الحصة', en: 'Session Name' },
    student: { ar: 'الطالب', en: 'Student' },
    teacher: { ar: 'المعلم', en: 'Teacher' },
    subject: { ar: 'المادة', en: 'Subject' },
    duration: { ar: 'مدة الحصة', en: 'Session Duration' },
    minutes: { ar: 'دقيقة', en: 'minutes' },
    meetingLink: { ar: 'رابط الحصة', en: 'Meeting Link' },
    openLink: { ar: 'فتح الرابط', en: 'Open Link' },
    packageInfo: { ar: 'معلومات الباقة', en: 'Package Information' },
    packageName: { ar: 'اسم الباقة', en: 'Package Name' },
    totalSessions: { ar: 'إجمالي الحصص', en: 'Total Sessions' },
    sessionsUsed: { ar: 'الحصص المستخدمة', en: 'Sessions Used' },
    sessionsRemaining: { ar: 'الحصص المتبقية', en: 'Sessions Remaining' },
    schedule: { ar: 'جدول الحصص', en: 'Session Schedule' },
    day: { ar: 'اليوم', en: 'Day' },
    date: { ar: 'التاريخ', en: 'Date' },
    time: { ar: 'الوقت', en: 'Time' },
    status: { ar: 'الحالة', en: 'Status' },
    scheduled: { ar: 'مجدولة', en: 'Scheduled' },
    completed: { ar: 'مكتملة', en: 'Completed' },
    cancelled: { ar: 'ملغية', en: 'Cancelled' },
    close: { ar: 'إغلاق', en: 'Close' },
    edit: { ar: 'تعديل', en: 'Edit' },
    joinSession: { ar: 'دخول الحصة', en: 'Join Session' },
    actions: { ar: 'الإجراءات', en: 'Actions' }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen || !sessionGroup) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1  overflow-y-auto no-scrollbar p-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 text-start mb-6">{sessionGroup.sessionName}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-xs text-gray-500">{text.student[language]}</p>
                    <p className="font-semibold text-gray-900">{sessionGroup.student}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-xs text-gray-500">{text.teacher[language]}</p>
                    <p className="font-semibold text-gray-900">{sessionGroup.teacher}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-xs text-gray-500">{text.subject[language]}</p>
                    <p className="font-semibold text-gray-900">{sessionGroup.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-xs text-gray-500">{text.duration[language]}</p>
                    <p className="font-semibold text-gray-900">{sessionGroup.duration} {text.minutes[language]}</p>
                  </div>
                </div>
              </div>

              {sessionGroup.meetingLink && (
                <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500 text-start mb-2">{text.meetingLink[language]}</p>
                  <div className="flex items-center gap-3">
                    <a
                      href={sessionGroup.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
                    >
                      {text.openLink[language]}
                    </a>
                    <div className="flex-1 text-sm text-gray-600 break-all text-start" dir="ltr">
                      {sessionGroup.meetingLink}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 text-start mb-4 flex items-center justify-end gap-2">
                <span>{text.packageInfo[language]}</span>
                <Calendar className="w-5 h-5 text-green-600" />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm text-start">
                  <p className="text-xs text-gray-500 mb-1">{text.packageName[language]}</p>
                  <p className="text-lg font-bold text-gray-900">{sessionGroup.packageInfo.packageName}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm text-start">
                  <p className="text-xs text-gray-500 mb-1">{text.totalSessions[language]}</p>
                  <p className="text-lg font-bold text-blue-600">{sessionGroup.packageInfo.totalSessions}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm text-start">
                  <p className="text-xs text-gray-500 mb-1">{text.sessionsUsed[language]}</p>
                  <p className="text-lg font-bold text-orange-600">{sessionGroup.packageInfo.sessionsUsed}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm text-start">
                  <p className="text-xs text-gray-500 mb-1">{text.sessionsRemaining[language]}</p>
                  <p className="text-lg font-bold text-green-600">{sessionGroup.packageInfo.sessionsRemaining}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 text-start">{text.schedule[language]}</h3>
              </div>

              <div className="p-4 max-h-96  overflow-y-auto no-scrollbar">
                <div className="space-y-3">
                  {sessionGroup.sessions.map((session, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4" dir="rtl">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-gray-500 text-start">{text.day[language]}</p>
                            <p className="font-bold text-gray-900 text-start">{session.day}</p>
                          </div>

                          <div className="border-r border-gray-300 pr-4">
                            <p className="text-xs text-gray-500 text-start">{text.date[language]}</p>
                            <p className="font-medium text-gray-900 text-start">{session.date}</p>
                          </div>

                          <div className="border-r border-gray-300 pr-4">
                            <p className="text-xs text-gray-500 text-start">{text.time[language]}</p>
                            <p className="font-medium text-gray-900 text-start" dir="ltr">
                              {session.time} - {session.endTime}
                            </p>
                          </div>

                          <div className="border-r border-gray-300 pr-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(session.status)}`}>
                              {text[session.status][language]}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {session.status === 'scheduled' && onJoinSession && (
                            <button
                              onClick={() => onJoinSession(sessionGroup.id, index)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <Video className="w-4 h-4" />
                              {text.joinSession[language]}
                            </button>
                          )}
                          {onEditSession && !readOnly && (
                            <button
                              onClick={() => onEditSession(sessionGroup.id, index)}
                              className="p-2 text-blue-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title={text.edit[language]}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            {text.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
