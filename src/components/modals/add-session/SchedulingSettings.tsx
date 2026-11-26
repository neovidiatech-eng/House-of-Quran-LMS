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
  errors?: any;
  durationMinutes?: number;
}

export default function SchedulingSettings({
  schedulingMode,
  setSchedulingMode,
  register,
  watchSelectedDays,
  setValue,
  DAYS,
  control,
  errors = {},
  durationMinutes,
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
            <div>
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
              {errors?.sessionDate && (
                <p className="error-text text-red-500 text-xs mt-1">
                  {errors.sessionDate.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('startTime')}</label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="input"
                />
                {errors?.startTime && (
                  <p className="error-text text-red-500 text-xs mt-1">
                    {errors.startTime.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span>{t('endTime')}</span>
                  {durationMinutes ? (
                    <span className="text-[11px] font-normal text-indigo-600">
                      ({durationMinutes} {language === 'ar' ? 'دقيقة' : 'min'})
                    </span>
                  ) : null}
                </label>
                <input
                  type="time"
                  {...register('endTime')}
                  readOnly
                  className="input bg-gray-100"
                />
                {errors?.endTime && (
                  <p className="error-text text-red-500 text-xs mt-1">
                    {errors.endTime.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-box">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
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
              {errors?.batchStartDate && (
                <p className="error-text text-red-500 text-xs mt-1">
                  {errors.batchStartDate.message as string}
                </p>
              )}
            </div>
            <div>
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
              {errors?.batchEndDate && (
                <p className="error-text text-red-500 text-xs mt-1">
                  {errors.batchEndDate.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="label">{t('startTime')}</label>
              <input
                type="time"
                {...register('startTime')}
                className="input"
              />
              {errors?.startTime && (
                <p className="error-text text-red-500 text-xs mt-1">
                  {errors.startTime.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>{t('endTime')}</span>
                {durationMinutes ? (
                  <span className="text-[11px] font-normal text-indigo-600">
                    ({durationMinutes} {language === 'ar' ? 'دقيقة' : 'min'})
                  </span>
                ) : null}
              </label>
              <input
                type="time"
                {...register('endTime')}
                readOnly
                className="input bg-gray-100"
              />
              {errors?.endTime && (
                <p className="error-text text-red-500 text-xs mt-1">
                  {errors.endTime.message as string}
                </p>
              )}
            </div>
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
