import { useState } from 'react';
import { AlertTriangle, Calendar, ChevronDown, Edit2, Trash2, Check, X, RotateCcw, Clock } from 'lucide-react';
import { Subject } from '../../../types/subject';
import { useTranslation } from 'react-i18next';

export interface PreviewSessionItem {
  id: string;
  originalDate: string;
  date: string;
  time: string;
  endTime?: string;
  available: boolean;
  isCustomized?: boolean;
}

interface SessionPreviewProps {
  previewSessions: PreviewSessionItem[];
  formatDateCard: (date: string) => { month: string; day: number };
  watchTitle: string;
  selectedSubject: Subject | null;
  watchStartTime: string;
  watchEndTime?: string;
  sessionsLimitError?: string;
  requestedSessionsCount?: number;
  remainingSessions?: number;
  onUpdateSession?: (id: string, newDate: string, newStartTime: string, newEndTime?: string) => void;
  onDeleteSession?: (id: string) => void;
  onResetSessions?: () => void;
  hasCustomizations?: boolean;
  apiConflicts?: {date: string, conflict: string}[];
}

const calcEndTime = (startTimeStr: string, durationMinutes: number = 60): string => {
  if (!startTimeStr) return '';
  const [h, m] = startTimeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setMinutes(d.getMinutes() + durationMinutes);
  const endH = String(d.getHours()).padStart(2, '0');
  const endM = String(d.getMinutes()).padStart(2, '0');
  return `${endH}:${endM}`;
};

const formatTime12Hour = (timeStr: string, language: string) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  if (!hStr || !mStr) return timeStr;
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return timeStr;
  
  const date = new Date();
  date.setHours(h, m, 0, 0);
  
  return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function SessionPreview({
  previewSessions,
  formatDateCard,
  watchTitle,
  selectedSubject,
  watchStartTime,
  watchEndTime,
  sessionsLimitError,
  requestedSessionsCount = 0,
  remainingSessions = 0,
  onUpdateSession,
  onDeleteSession,
  onResetSessions,
  hasCustomizations = false,
  apiConflicts = [],
}: SessionPreviewProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');

  const startEditing = (session: PreviewSessionItem) => {
    const startTimeToUse = session.time || watchStartTime || '14:00';
    const endTimeToUse = session.endTime || watchEndTime || calcEndTime(startTimeToUse, 60);

    setEditingId(session.id);
    setEditDate(session.date);
    setEditTime(startTimeToUse);
    setEditEndTime(endTimeToUse);
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setEditTime(newStartTime);
    setEditEndTime(calcEndTime(newStartTime, 60));
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = (id: string) => {
    if (onUpdateSession && editDate && editTime) {
      onUpdateSession(id, editDate, editTime, editEndTime);
    }
    setEditingId(null);
  };

  return (
    <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100 overflow-y-auto">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{t('addSession_schedulePreview')}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {previewSessions.length} {t('sessions')}
          </p>
        </div>
        {hasCustomizations && onResetSessions && (
          <button
            type="button"
            onClick={onResetSessions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={language === 'ar' ? 'إعادة ضبط الحصص للشكل التلقائي' : 'Reset to default schedule'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {sessionsLimitError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-start">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">
                  {t('addSession_cannotCreateSessions')}
                </p>
                <p className="text-xs text-red-600 mt-1">{sessionsLimitError}</p>
                <p className="text-xs text-red-500 mt-2">
                  {t('addSession_requestedRemaining', {
                    requestedSessionsCount,
                    remainingSessions,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {previewSessions.length ? (
          previewSessions.map((session) => {
            const date = formatDateCard(session.date);
            const isEditing = editingId === session.id;
            const displayStartTime = session.time || watchStartTime || '14:00';
            const displayEndTime = session.endTime || watchEndTime || calcEndTime(displayStartTime, 60);

            const formattedStartTime = formatTime12Hour(displayStartTime, language);
            const formattedEndTime = formatTime12Hour(displayEndTime, language);
            
            const conflictForSession = apiConflicts.find(c => c.date === session.date);

            return (
              <div
                key={session.id}
                className={`rounded-2xl p-4 border transition-all duration-200 ${
                  session.isCustomized
                    ? 'bg-indigo-50/40 border-indigo-200 shadow-sm'
                    : session.available
                    ? 'bg-white border-gray-100'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-700">
                        {language === 'ar' ? 'تعديل معاد الحصة' : 'Edit Session Time'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => saveEditing(session.id)}
                          className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          title={t('save') || 'Save'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                          title={t('cancel') || 'Cancel'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                        {t('sessionDate') || 'Date'}
                      </label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                          {t('startTime') || 'Start Time'}
                        </label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                          {t('endTime') || 'End Time'}
                        </label>
                        <input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] uppercase font-black text-gray-500">
                        {date.month}
                      </span>
                      <span className="font-black text-lg text-gray-800">{date.day}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {watchTitle || t('addSession_untitledSession')}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {session.isCustomized && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                              {language === 'ar' ? 'معدل' : 'Modified'}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              session.available
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {session.available ? t('addSession_available') : t('addSession_conflict')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {selectedSubject
                          ? (language === 'ar'
                            ? (selectedSubject.name_ar || selectedSubject.name_en)
                            : (selectedSubject.name_en || selectedSubject.name_ar))
                          : t('addSession_noSubject')}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span dir="ltr">{formattedStartTime} - {formattedEndTime}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {onUpdateSession && (
                            <button
                              type="button"
                              onClick={() => startEditing(session)}
                              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={t('edit') || 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteSession && (
                            <button
                              type="button"
                              onClick={() => onDeleteSession(session.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('delete') || 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {conflictForSession && (
                        <div className="mt-2 text-[11.5px] font-bold text-red-500">
                          {conflictForSession.conflict === 'STUDENT_NOT_AVAILABLE'
                            ? (language === 'ar' ? 'الطالب غير متوفر في هذا الميعاد' : 'Student is not available at this time')
                            : (language === 'ar' ? 'المعلم غير متوفر في هذا الميعاد' : 'Teacher is not available at this time')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">{t('addSession_noSessionsGenerated')}</p>
          </div>
        )}

        {previewSessions.length > 8 && (
          <button
            type="button"
            className="w-full text-indigo-600 text-sm font-bold flex items-center justify-center gap-1 py-2"
          >
            {t('viewMore')}
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
