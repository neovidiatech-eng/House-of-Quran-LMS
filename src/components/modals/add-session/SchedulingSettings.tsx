import { DayOfWeek } from '../../../types/scheduales';
import { UseFormRegister, UseFormSetValue, Control, Controller } from 'react-hook-form';
import DatePickerField from '../../ui/DatePickerField';
import { useTranslation } from 'react-i18next';

interface SchedulingSettingsProps {
  schedulingMode: 'single' | 'batch';
  setSchedulingMode: (mode: 'single' | 'batch') => void;
  register: UseFormRegister<any>;
  watchSelectedDays: DayOfWeek[];
  setValue: UseFormSetValue<any>;
  DAYS: DayOfWeek[];
  control: Control<any>;
}

export default function SchedulingSettings({
  schedulingMode,
  setSchedulingMode,
  register,
  watchSelectedDays,
  setValue,
  DAYS,
  control,
}: SchedulingSettingsProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  const getDayLabel = (day: DayOfWeek) => {
    const dayKeyMap: Record<DayOfWeek, string> = {
      Sunday: 'sun',
      Monday: 'mon',
      Tuesday: 'tue',
      Wednesday: 'wed',
      Thursday: 'thu',
      Friday: 'fri',
      Saturday: 'sat',
    };

    return t(dayKeyMap[day]);
  };

  return (
    <>
      {/* Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setSchedulingMode('single')}
            className={`toggle-btn ${schedulingMode === 'single' ? 'active-toggle' : ''
              }`}
          >
            {t('addSession_singleMode')}
          </button>

          <button
            type="button"
            onClick={() => setSchedulingMode('batch')}
            className={`toggle-btn ${schedulingMode === 'batch' ? 'active-toggle' : ''
              }`}
          >
            {t('addSession_batchMode')}
          </button>
        </div>
      </div>

      {/* SINGLE */}
      {schedulingMode === 'single' ? (
        <div className="card-box">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Controller
              name="sessionDate"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label={t('sessionDate')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('startTime')}</label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="input"
                />
              </div>

              <div>
                <label className="label">{t('endTime')}</label>
                <input
                  type="time"
                  {...register('endTime')}
                  readOnly
                  className="input bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-box">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <Controller
              name="batchStartDate"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label={t('fromDate')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="batchEndDate"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label={t('toDate')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="mb-5">
            <label className="label">{t('startTime')}</label>
            <input type="time" {...register('startTime')} className="input" />
          </div>

          <div>
            <label className="label">{t('scheduledDays')}</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const selected = watchSelectedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setValue(
                          'selectedDays',
                          watchSelectedDays.filter((d) => d !== day)
                        );
                      } else {
                        setValue('selectedDays', [...watchSelectedDays, day]);
                      }
                    }}
                    className={`day-btn ${selected ? 'bg-primary text-white' : 'bg-white'
                      }`}
                  >
                    {language === 'ar' ? getDayLabel(day) : day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
