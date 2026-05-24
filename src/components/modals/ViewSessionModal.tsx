import { X, Calendar, Clock, User, GraduationCap, Video, FileText, Bell, ExternalLink, Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Schedule } from '../../types/scheduales';

interface ViewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Schedule | null;
  groupedSessions?: Schedule[];
  allSessions?: Schedule[];
}

export default function ViewSessionModal({ isOpen, onClose, session, groupedSessions, allSessions = [] }: ViewSessionModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isParent = localStorage.getItem('role') === 'parent';

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-primary-50 text-blue-600 border-blue-100';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: '', time: '' };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: dateString, time: '' };
      const formattedDate = date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit', minute: '2-digit'
      });
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: dateString, time: '' };
    }
  };

  const calculateDuration = (startTime: any, endTime: any) => {
    if (!startTime || !endTime) return 0;
    
    // Check if they are full ISO/Date strings by trying to parse them with Date
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    if (!isNaN(start) && !isNaN(end)) {
      return Math.max(0, Math.round((end - start) / 60000));
    }
    
    // If not parseable as full dates, fall back to "HH:MM" string split
    try {
      const getMinutes = (timeStr: string) => {
        // If it contains "T", extract the time part first
        const cleanTime = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
        const parts = cleanTime.split(":");
        const h = Number(parts[0]) || 0;
        const m = Number(parts[1]) || 0;
        return h * 60 + m;
      };
      
      const startTotal = getMinutes(String(startTime));
      const endTotal = getMinutes(String(endTime));
      let diff = endTotal - startTotal;
      if (diff < 0) diff += 24 * 60;
      return diff;
    } catch {
      return 0;
    }
  };

  if (!isOpen || !session) return null;

  const { date: sessionDate, time: sessionTime } = formatDateTime(session.start_time);
  const { time: endTime } = formatDateTime(session.end_time);
  const duration = calculateDuration(session.start_time, session.end_time);

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-primary-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('sessionDetails')}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{session.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(session.status)}`}>
              {t(session.status?.toLowerCase() || '')}
            </span>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          
          {/* Left Column - Session Details */}
          <div className="w-full lg:w-[58%] p-6 md:p-8 bg-white overflow-y-auto custom-scrollbar">
            
            {/* People & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-primary-50 text-blue-500 group-hover:scale-110 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('studentLabel')}</p>
                  <p className="text-sm font-bold text-gray-900">{session.student?.user?.name || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('teacherLabel')}</p>
                  <p className="text-sm font-bold text-gray-900">{session.teacher?.user?.name || '—'}</p>
                </div>
              </div>
{/* 
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-fuchsia-50 text-fuchsia-500 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('subjectLabel')}</p>
                  <p className="text-sm font-bold text-gray-900">{session.course.title ||""}</p>
                </div>
              </div>  */}

              {/* <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('type')}</p>
                  <p className="text-sm font-bold text-gray-900">{t(session.type?.toLowerCase() || '') || session.type || '—'}</p>
                </div>
              </div> */}
            </div>

            {/* Schedule & Duration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50/50 rounded-2xl p-4 border border-indigo-100/50">
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">{t('date')}</p>
                </div>
                <p className="text-sm font-black text-indigo-700">{sessionDate}</p>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">{t('time')}</p>
                </div>
                <p className="text-sm font-black text-emerald-700" dir="ltr">{sessionTime} — {endTime}</p>
              </div>
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">{t('duration')}</p>
                </div>
                <p className="text-sm font-black text-amber-700">{duration} {t('minutes')}</p>
              </div>
            </div>

            {/* Notification */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('notificationTime')}</p>
                <p className="text-sm font-bold text-gray-800">10 {t('minutes')}</p>
              </div>
            </div>

            {/* Meeting Link */}
            {session.link && !isParent && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('meetingLink')}</p>
                <div className="flex items-center gap-3">
                  <a
                    href={session.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-700 text-white rounded-xl transition-all text-xs font-bold shadow-sm active:scale-95"
                  >
                    <Video className="w-4 h-4" />
                    {t('joinSession')}
                  </a>
                  <span className="text-xs text-gray-400 break-all" dir="ltr">{session.link}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {session.notes && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('notes')}</p>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{session.notes}</p>
              </div>
            )}

            {/* Session Logs */}
           
          </div>

          {/* Right Column - Recurring Sessions / Other Sessions */}
          <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100/80 flex flex-col overflow-hidden">

  {/* Recurring Sessions Header */}
  {(session.is_recurring || session.parent_recurring_id) && groupedSessions && groupedSessions.length > 1 ? (
    <>
      <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-indigo-500" />
          <h3 className="font-bold text-gray-900 text-sm">{t('recurringSessions')}</h3>
        </div>
        <span className="px-3 py-1 bg-primary-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
          {groupedSessions.length} {t('sessions')}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {groupedSessions.map((s) => {
          const { date, time } = formatDateTime(s.start_time);
          const { time: endT } = formatDateTime(s.end_time);
          const isCurrent = s.id === session.id;

          return (
            <div
              key={s.id}
              className={`bg-white border rounded-2xl p-4 transition-all ${
                isCurrent
                  ? 'border-indigo-200 ring-2 ring-indigo-500/10 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">

                <div className="flex-1">

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {t(s.day_of_week?.toLowerCase() || '') || s.day_of_week || '—'}
                    </span>

                    {isCurrent && (
                      <span className="text-[8px] font-black text-indigo-600 bg-primary-50 px-1.5 py-0.5 rounded">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-gray-800">{date}</p>

                  <p className="text-[10px] font-bold text-gray-400 mt-0.5" dir="ltr">
                    {time} - {endT}
                  </p>

                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-widest ${getStatusStyle(s.status)}`}
                  >
                    {t(s.status?.toLowerCase() || '')}
                  </span>

                  {s.link && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </>
  ) : allSessions.length > 1 ? (
    <>
      <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <h3 className="font-bold text-gray-900 text-sm">{t('otherTeacherSessions')}</h3>
        </div>
        <span className="px-3 py-1 bg-primary-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
          {allSessions.length} {t('sessions')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {allSessions
          .filter(s => s.id !== session.id)
          .map((s) => {
            const { date, time } = formatDateTime(s.start_time);
            const dur = calculateDuration(s.start_time, s.end_time);

            return (
              <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-all">
                <div className="flex items-center justify-between gap-3">

                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{s.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {s.student?.user?.name}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-bold text-gray-400">{date}</span>
                      <span className="text-[10px] font-bold text-gray-300">•</span>
                      <span className="text-[10px] font-bold text-gray-400" dir="ltr">{time}</span>
                      <span className="text-[10px] font-bold text-gray-300">•</span>
                      <span className="text-[10px] font-bold text-gray-400">{dur}m</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-widest ${getStatusStyle(s.status)}`}>
                    {t(s.status?.toLowerCase() || '')}
                  </span>

                </div>
              </div>
            );
          })}
      </div>
    </>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-sm font-bold text-gray-400 mb-1">
        {language === 'ar' ? 'لا توجد جلسات أخرى' : 'No other sessions'}
      </p>
      <p className="text-xs text-gray-300">
        {language === 'ar' ? 'هذه جلسة مستقلة' : 'This is a standalone session'}
      </p>
    </div>
  )}
</div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-xs shadow-lg active:scale-95"
          >
            {t('close')}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
