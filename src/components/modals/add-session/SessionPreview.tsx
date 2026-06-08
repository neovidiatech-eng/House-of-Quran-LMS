import { AlertTriangle, Calendar, ChevronDown } from 'lucide-react';
import { Subject } from '../../../types/subject';
import { useTranslation } from 'react-i18next';

interface SessionPreviewProps {
  previewSessions: {
    date: string;
    available: boolean;
  }[];
  formatDateCard: (date: string) => { month: string; day: number };
  watchTitle: string;
  selectedSubject: Subject | null;
  watchStartTime: string;
  sessionsLimitError?: string;
  requestedSessionsCount?: number;
  remainingSessions?: number;
}

export default function SessionPreview({
  previewSessions,
  formatDateCard,
  watchTitle,
  selectedSubject,
  watchStartTime,
  sessionsLimitError,
  requestedSessionsCount = 0,
  remainingSessions = 0,
}: SessionPreviewProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  return (
    <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{t('addSession_schedulePreview')}</h3>
        <p className="text-xs text-gray-400 mt-1">
          {previewSessions.length} {t('sessions')}
        </p>
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
          previewSessions.map((session, index) => {
            const date = formatDateCard(session.date);

            return (
              <div
                key={index}
                className={`rounded-2xl p-4 border ${
                  session.available
                    ? 'bg-white border-gray-100'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-black text-gray-500">
                      {date.month}
                    </span>
                    <span className="font-black text-lg">{date.day}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-gray-900">
                        {watchTitle || t('addSession_untitledSession')}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                          session.available
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {session.available ? t('addSession_available') : t('addSession_conflict')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSubject
                        ? (language === 'ar'
                          ? (selectedSubject.name_ar || selectedSubject.name_en)
                          : (selectedSubject.name_en || selectedSubject.name_ar))
                        : t('addSession_noSubject')}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {watchStartTime}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">{t('addSession_noSessionsGenerated')}</p>
          </div>
        )}

        {previewSessions.length > 5 && (
          <button
            type="button"
            className="w-full text-indigo-600 text-sm font-bold flex items-center justify-center gap-1"
          >
            {t('viewMore')}
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
