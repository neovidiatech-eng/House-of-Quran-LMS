import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Video,
  FileText,
  ExternalLink,
  Repeat,
  Activity,
  LogIn,
  LogOut,
  Timer,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Schedule } from '../../types/scheduales';

interface ViewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Schedule | null;
  groupedSessions?: Schedule[];
  allSessions?: Schedule[];
  onEdit?: (session: Schedule) => void;
}

export default function ViewSessionModal({
  isOpen,
  onClose,
  session,
  groupedSessions,
}: ViewSessionModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isParent = localStorage.getItem('role') === 'parent';

  const [activeSession, setActiveSession] = useState<Schedule | null>(session);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (session) {
      setActiveSession(session);
    }
  }, [session]);

  const toggleLogExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'planned':
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
      const formattedDate = date.toLocaleDateString(
        language === 'ar' ? 'ar-EG' : 'en-US',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      );
      const formattedTime = date.toLocaleTimeString(
        language === 'ar' ? 'ar-EG' : 'en-US',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: dateString, time: '' };
    }
  };

  const formatTimeOnly = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString || '—';
    }
  };

  const formatDurationMinutes = (minutes?: number | null) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '—';
    const totalMins = Math.round(minutes);
    if (totalMins < 60) {
      return `${totalMins} ${t('minutes')}`;
    }
    const hours = Math.floor(totalMins / 60);
    const remainingMins = totalMins % 60;
    if (language === 'ar') {
      return remainingMins > 0
        ? `${hours} س ${remainingMins} د`
        : `${hours} ساعة`;
    }
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const calculateDuration = (startTime: any, endTime: any) => {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (!isNaN(start) && !isNaN(end)) {
      return Math.max(0, Math.round((end - start) / 60000));
    }

    try {
      const getMinutes = (timeStr: string) => {
        const cleanTime = timeStr.includes('T')
          ? timeStr.split('T')[1]
          : timeStr;
        const parts = cleanTime.split(':');
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

  if (!isOpen || !activeSession) return null;

  const { date: sessionDate, time: sessionTime } = formatDateTime(
    activeSession.start_time
  );
  const { time: endTime } = formatDateTime(activeSession.end_time);
  const duration = calculateDuration(
    activeSession.start_time,
    activeSession.end_time
  );

  const hasRecurringGroup = Boolean(
    (activeSession.is_recurring || activeSession.parent_recurring_id) &&
    groupedSessions &&
    groupedSessions.length > 1
  );

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div
        className={`bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full ${hasRecurringGroup ? 'max-w-[1020px]' : 'max-w-[640px]'
          } max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300`}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-primary-50 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {t('sessionDetails')}
              </h2>
              <p className="text-xs sm:text-[13px] font-semibold text-gray-400 mt-0.5">
                {activeSession.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(
                activeSession.status
              )}`}
            >
              {t(activeSession.status?.toLowerCase() || '')}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          {/* Main Column - Session Details */}
          <div
            className={`w-full ${hasRecurringGroup ? 'lg:w-[58%]' : 'w-full'
              } p-5 sm:p-7 bg-white overflow-y-auto custom-scrollbar space-y-5`}
          >
            {/* People */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3.5 group bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <div className="p-2.5 rounded-xl bg-primary-50 text-blue-500 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {t('studentLabel')}
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {activeSession.student?.user?.name || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 group bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {t('teacherLabel')}
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {activeSession.teacher?.user?.name || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule & Duration Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary-50/50 rounded-2xl p-3.5 border border-indigo-100/50 text-center sm:text-start">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5 text-indigo-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    {t('date')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black text-indigo-700 truncate">
                  {sessionDate}
                </p>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-3.5 border border-emerald-100/50 text-center sm:text-start">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5 text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    {t('time')}
                  </p>
                </div>
                <p
                  className="text-xs sm:text-sm font-black text-emerald-700 truncate"
                  dir="ltr"
                >
                  {sessionTime} - {endTime}
                </p>
              </div>
              <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100/50 text-center sm:text-start">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    {t('duration')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black text-amber-700 truncate">
                  {duration} {t('minutes')}
                </p>
              </div>
            </div>

            {/* Meeting Link */}
            {activeSession.link && !isParent && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t('meetingLink')}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={activeSession.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-xl transition-all text-xs font-bold shadow-sm active:scale-95 shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    {t('joinSession')}
                  </a>
                  <span
                    className="text-xs text-gray-400 break-all truncate"
                    dir="ltr"
                  >
                    {activeSession.link}
                  </span>
                </div>
              </div>
            )}

            {/* Attendance & Session Logs */}
            <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      {t('sessionLogs')}
                    </h4>
                  </div>
                </div>
              </div>

              {activeSession.scheduleLogs ? (
                <div className="space-y-3">
                  {/* Teacher Row / Card */}
                  <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs hover:border-gray-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {t('teacherAttendance')}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium truncate max-w-[180px]">
                            {activeSession.teacher?.user?.name || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {activeSession.scheduleLogs.isTeacherLate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                            <Clock className="w-2.5 h-2.5" />
                            {t('teacherLate')}
                          </span>
                        ) : activeSession.scheduleLogs.joinTime_teacher ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {t('teacherOnTime')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                            {t('notJoinedYet')}
                          </span>
                        )}
                        {activeSession.scheduleLogs.isTeacherCompleted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                            {t('teacherCompleted')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
                      <div className="bg-slate-50/70 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 mb-0.5">
                          <LogIn className="w-3 h-3 text-emerald-500" />
                          <span>{t('joinTime')}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800" dir="ltr">
                          {formatTimeOnly(
                            activeSession.scheduleLogs.joinTime_teacher
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 mb-0.5">
                          <LogOut className="w-3 h-3 text-rose-400" />
                          <span>{t('leaveTime')}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800" dir="ltr">
                          {formatTimeOnly(
                            activeSession.scheduleLogs.leaveTime_teacher
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 mb-0.5">
                          <Timer className="w-3 h-3 text-indigo-500" />
                          <span>{t('attendedDuration')}</span>
                        </div>
                        <p className="text-xs font-black text-indigo-600">
                          {formatDurationMinutes(
                            activeSession.scheduleLogs.duration_teacher
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Student Row / Card */}
                  <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs hover:border-gray-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {t('studentAttendance')}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium truncate max-w-[180px]">
                            {activeSession.student?.user?.name || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {activeSession.scheduleLogs.isStudentAttended ||
                          activeSession.scheduleLogs.joinTime_student ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {t('studentAttended')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {t('studentAbsent')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
                      <div className="bg-slate-50/70 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 mb-0.5">
                          <LogIn className="w-3 h-3 text-emerald-500" />
                          <span>{t('joinTime')}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800" dir="ltr">
                          {formatTimeOnly(
                            activeSession.scheduleLogs.joinTime_student
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 mb-0.5">
                          <LogOut className="w-3 h-3 text-rose-400" />
                          <span>{t('leaveTime')}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800" dir="ltr">
                          {formatTimeOnly(
                            activeSession.scheduleLogs.leaveTime_student
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 mb-0.5">
                          <Timer className="w-3 h-3 text-indigo-500" />
                          <span>{t('attendedDuration')}</span>
                        </div>
                        <p className="text-xs font-black text-indigo-600">
                          {formatDurationMinutes(
                            activeSession.scheduleLogs.duration_student
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-dashed border-gray-200 text-center">
                  <Clock className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-400">
                    {t('noLogsAvailable')}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {activeSession.notes && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {t('notes')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
                  {activeSession.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Recurring Sessions (Only rendered if there are batch sessions) */}
          {hasRecurringGroup && groupedSessions && (
            <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100/80 flex items-center justify-between bg-white/70 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-gray-900 text-sm">
                    {t('recurringSessions')}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-primary-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                  {groupedSessions.length} {t('sessions')}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {groupedSessions.map((s) => {
                  const { date, time } = formatDateTime(s.start_time);
                  const { time: endT } = formatDateTime(s.end_time);
                  const isCurrent = s.id === activeSession.id;
                  const hasLogs = !!s.scheduleLogs;
                  const isExpanded = !!expandedLogs[s.id];

                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveSession(s)}
                      className={`bg-white border rounded-2xl p-3.5 transition-all cursor-pointer ${isCurrent
                          ? 'border-indigo-300 ring-2 ring-indigo-500/15 shadow-sm bg-indigo-50/10'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-xs'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {t(s.day_of_week?.toLowerCase() || '') ||
                                s.day_of_week ||
                                '—'}
                            </span>

                            {isCurrent && (
                              <span className="text-[8px] font-black text-indigo-600 bg-primary-50 px-1.5 py-0.5 rounded">
                                CURRENT
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-gray-800">
                            {date}
                          </p>

                          <p
                            className="text-[10px] font-bold text-gray-400 mt-0.5"
                            dir="ltr"
                          >
                            {time} - {endT}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-widest ${getStatusStyle(
                              s.status
                            )}`}
                          >
                            {t(s.status?.toLowerCase() || '')}
                          </span>

                          {s.link && (
                            <a
                              href={s.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-indigo-500 hover:text-indigo-700 transition-colors p-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Expandable mini log toggle */}
                      <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => toggleLogExpand(s.id, e)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Activity className="w-3 h-3" />
                          <span>
                            {isExpanded ? t('hideLogs') : t('attendanceLogs')}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {hasLogs && (
                          <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {s.scheduleLogs?.duration_teacher
                              ? formatDurationMinutes(
                                s.scheduleLogs.duration_teacher
                              )
                              : 'Logs available'}
                          </span>
                        )}
                      </div>

                      {/* Expanded Mini Logs Breakdown */}
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                          {s.scheduleLogs ? (
                            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/80 p-2.5 rounded-xl">
                              {/* Teacher mini log */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 font-bold text-emerald-700 text-[10px]">
                                  <GraduationCap className="w-3 h-3 shrink-0" />
                                  <span>{t('teacherAttendance')}</span>
                                </div>
                                <div className="text-gray-500" dir="ltr">
                                  <span className="text-gray-400">In:</span>{' '}
                                  {formatTimeOnly(
                                    s.scheduleLogs.joinTime_teacher
                                  )}
                                </div>
                                <div className="text-gray-500" dir="ltr">
                                  <span className="text-gray-400">Out:</span>{' '}
                                  {formatTimeOnly(
                                    s.scheduleLogs.leaveTime_teacher
                                  )}
                                </div>
                                {s.scheduleLogs.duration_teacher != null && (
                                  <div className="font-bold text-indigo-600">
                                    {formatDurationMinutes(
                                      s.scheduleLogs.duration_teacher
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Student mini log */}
                              <div className="space-y-1 border-s border-gray-200 ps-2">
                                <div className="flex items-center gap-1 font-bold text-blue-700 text-[10px]">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span>{t('studentAttendance')}</span>
                                </div>
                                <div className="text-gray-500" dir="ltr">
                                  <span className="text-gray-400">In:</span>{' '}
                                  {formatTimeOnly(
                                    s.scheduleLogs.joinTime_student
                                  )}
                                </div>
                                <div className="text-gray-500" dir="ltr">
                                  <span className="text-gray-400">Out:</span>{' '}
                                  {formatTimeOnly(
                                    s.scheduleLogs.leaveTime_student
                                  )}
                                </div>
                                {s.scheduleLogs.duration_student != null && (
                                  <div className="font-bold text-indigo-600">
                                    {formatDurationMinutes(
                                      s.scheduleLogs.duration_student
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-center text-gray-400 py-1 font-medium">
                              {t('noLogsAvailable')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-xs shadow-md active:scale-95"
          >
            {t('close')}
          </button>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />
    </div>
  );
}
