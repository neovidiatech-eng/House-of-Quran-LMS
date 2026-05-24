import { Clock, Hourglass } from 'lucide-react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface TypeSelectorProps {
  watchType: 'full' | 'half';
  setValue: UseFormSetValue<any>;
}

export default function TypeSelector({
  watchType,
  setValue,
}: TypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <label className="label mb-3">{t('type') || 'Session Type'}</label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setValue('type', 'full')}
          className={`platform-btn ${
            watchType === 'full' ? 'active-platform' : ''
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          {t('full') || 'Full Session'}
        </button>

        <button
          type="button"
          onClick={() => setValue('type', 'half')}
          className={`platform-btn ${
            watchType === 'half' ? 'active-platform' : ''
          }`}
        >
          <Hourglass className="w-4 h-4 text-amber-500" />
          {t('half') || 'Half Session'}
        </button>
      </div>
    </div>
  );
}
