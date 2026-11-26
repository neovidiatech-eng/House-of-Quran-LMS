import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StudentPlanCardProps {
  studentPlanInfo: {
    planName: string | null;
    sessionDuration?: number | null;
    totalSessions: number;
    sessionsAttended: number;
    sessionsRemaining: number;
  } | null;
}

export default function StudentPlanCard({
  studentPlanInfo,
}: StudentPlanCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  if (!studentPlanInfo) return null;

  return (
    <div className="mb-6 p-4 rounded-3xl border border-indigo-100 bg-primary-50/50">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-indigo-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
          {t('packageInfo')}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('packageName')}</p>
          <p className="font-bold text-sm">
            {studentPlanInfo.planName || t('noPlan')}
          </p>
        </div>

        {studentPlanInfo.sessionDuration ? (
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {language === 'ar' ? 'مدة الحصة' : 'Session Duration'}
            </p>
            <p className="font-bold text-sm text-indigo-600">
              {studentPlanInfo.sessionDuration} {language === 'ar' ? 'دقيقة' : 'min'}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-xs text-gray-500 mb-1">{t('sessionsRemaining')}</p>
          <p className="font-black text-emerald-600">
            {studentPlanInfo.sessionsRemaining}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">{t('addSession_attended')}</p>
          <p className="font-black text-amber-500">
            {studentPlanInfo.sessionsAttended}
          </p>
        </div>
      </div>
    </div>
  );
}
