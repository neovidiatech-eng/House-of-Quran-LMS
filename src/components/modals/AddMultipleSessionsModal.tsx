import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { useStudents } from '../../features/admin/hooks/useStudents';
import { getMultipleSessionsSchema, MultipleSessionsFormData, MultipleSessionsPayload } from '../../lib/schemas/SessionSchema';
import { DayOfWeek } from '../../types/scheduales';
import { message } from 'antd';

export interface SessionPreviewItem {
  date: string;
  day: string;
  time: string;
}
interface AddMultipleSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: MultipleSessionsPayload) => void;
}

export default function AddMultipleSessionsModal({ isOpen, onClose, onAdd }: AddMultipleSessionsModalProps) {
  const { language, t } = useLanguage();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<MultipleSessionsFormData>({
    resolver: zodResolver(getMultipleSessionsSchema(t)),
    defaultValues: {
      duration: '60',
      student: '',
      teacher: '',
      subject: '',
      monthYear: '',
      meetingLink: '',
      description: '',
      type: 'full',
      notification_Time: '10',
      notes: ''
    }
  });

  const watchedStudent = watch('student');
  const watchedTeacher = watch('teacher');
  const watchedMonthYear = watch('monthYear');
  const watchedDuration = watch('duration');

  const weekDaysData = [
    { id: 'sunday', nameKey: 'sunday' },
    { id: 'monday', nameKey: 'monday' },
    { id: 'tuesday', nameKey: 'tuesday' },
    { id: 'wednesday', nameKey: 'wednesday' },
    { id: 'thursday', nameKey: 'thursday' },
    { id: 'friday', nameKey: 'fri' },
    { id: 'saturday', nameKey: 'sat' },
  ];

  const [weekDays, setWeekDays] = useState(
    weekDaysData.map(d => ({ ...d, checked: false, time: '10:00' }))
  );

  const { data: studentsData } = useStudents();
  const { data: teachersData } = useTeacher();

  const students = studentsData?.data?.studentsData || [];
  const teachers = teachersData?.teachers || [];

  const studentOptions = students.map(s => ({ value: s.id, label: s.user.name }));
  const teacherOptions = teachers.map(t => ({ value: t.id, label: t.user.name }));

  const selectedTeacherData = teachers.find(t => t.id === watchedTeacher);
  const availableSubjects = useMemo(() => {
    return selectedTeacherData ? selectedTeacherData.teacherSubjects.map((ts) => ({
      value: ts.subject.id,
      label: language === 'ar' ? ts.subject.name_ar : ts.subject.name_en
    })) : [];
  }, [selectedTeacherData, language]);

  const selectedStudentData = students.find(s => s.id === watchedStudent);
  const selectedStudentPackage = selectedStudentData ? {
    name: language === 'ar' ? selectedStudentData.plan?.name_ar : selectedStudentData.plan?.name_en || 'No Package',
    sessionsRemaining: selectedStudentData.sessions_remaining || 0,
    totalSessions: selectedStudentData.sessions || 0,
  } : null;

  const sessionPreview = useMemo(() => {
    if (!watchedMonthYear) return [];
    const [year, month] = watchedMonthYear.split('-').map(Number);
    const selectedDays = weekDays.filter(day => day.checked);
    const sessions = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let date = 1; date <= daysInMonth; date++) {
      const currentDate = new Date(year, month - 1, date);
      const dayOfWeek = currentDate.getDay();
      const matchingDay = selectedDays.find(day =>
        ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day.id) === dayOfWeek
      );

      if (matchingDay) {
        sessions.push({
          date: currentDate.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          day: t(matchingDay.nameKey),
          time: matchingDay.time
        });
      }
    }
    return sessions;
  }, [watchedMonthYear, weekDays, language]);

  const sessionsExceedPackage = selectedStudentPackage && sessionPreview.length > selectedStudentPackage.sessionsRemaining;

  const calculateEndTime = (startTime: string, duration: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + parseInt(duration);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const onSubmit = (data: MultipleSessionsFormData) => {
    if (sessionPreview.length === 0) {
      message.warning(t('addMultipleSessions_selectOneDayMin'));
      return;
    }
    if (sessionsExceedPackage) {
      message.error(t('addMultipleSessions_sessionsExceedPackage'));
      return;
    }

    const selectedDays = weekDays
      .filter(d => d.checked)
      .map(d => (d.id.charAt(0).toUpperCase() + d.id.slice(1)) as DayOfWeek);

    onAdd({
      formData: data,
      sessions: sessionPreview,
      selectedDays
    });
    reset();
    setWeekDays(prev => prev.map(d => ({ ...d, checked: false })));
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">{t('addMultipleSessions_title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="text-white/80" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2 text-start">
            <label className="text-sm font-medium">{t('addMultipleSessions_sessionName')} *</label>
            <input
              {...register('title')}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary text-start ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={t('addMultipleSessions_sessionNamePlaceholder')}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="student"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label={t('studentLabel')}
                  options={studentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.student?.message}
                />
              )}
            />

            <Controller
              name="teacher"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label={t('teacherLabel')}
                  options={teacherOptions}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue('subject', '');
                  }}
                  error={errors.teacher?.message}
                />
              )}
            />
          </div>

          {selectedStudentPackage && (
            <div className="bg-primary-50 border border-blue-200 rounded-xl p-4 text-start">
              <p className="text-sm font-bold text-blue-900 mb-2">{t('addMultipleSessions_packageDetails')}</p>
              <div className="flex justify-between text-xs text-blue-700">
                <span>{t('addMultipleSessions_totalSessions')}: {selectedStudentPackage.totalSessions}</span>
                <span>{t('addMultipleSessions_remaining')}: {selectedStudentPackage.sessionsRemaining}</span>
                <span>{t('addMultipleSessions_package')}: {selectedStudentPackage.name}</span>
              </div>
            </div>
          )}

          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label={t('subjectLabel')}
                options={availableSubjects}
                value={field.value}
                onChange={field.onChange}
                disabled={!watchedTeacher}
                error={errors.subject?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            <div>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('type')}
                    value={field.value}
                    options={[
                      { value: 'full', label: t('full') },
                      { value: 'half', label: t('half') },
                    ]}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue('duration', val === 'half' ? '30' : '60');
                    }}
                  />
                )}
              />
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <Controller
                name="notification_Time"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('notificationTime')}
                    value={field.value}
                    options={[
                      { value: '10', label: language === 'ar' ? '10 دقائق' : '10 min' },
                      { value: '30', label: language === 'ar' ? '30 دقيقة' : '30 min' },
                      { value: '60', label: language === 'ar' ? '60 دقيقة' : '60 min' },
                    ]}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="text-start">
              <label className="block text-sm font-medium mb-2">{t('addMultipleSessions_meetingLink')}</label>
              <input type="url" {...register('meetingLink')} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-end" dir="ltr" />
              {errors.meetingLink && <p className="text-red-500 text-xs mt-1">{errors.meetingLink.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            <div>
              <label className="block text-sm font-medium mb-2">{t('description') || (language === 'ar' ? 'الوصف' : 'Description')}</label>
              <textarea
                {...register('description')}
                rows={2}
                className={`w-full px-4 py-3 border rounded-xl text-start resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('notes') || (language === 'ar' ? 'الملاحظات' : 'Notes')} *</label>
              <textarea
                {...register('notes')}
                rows={2}
                className={`w-full px-4 py-3 border rounded-xl text-start resize-none ${errors.notes ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            <div>
              <Controller
                name="monthYear"
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label={`${t('addMultipleSessions_monthYear')} *`}
                    picker="month"
                    placeholder={t('addMultipleSessions_monthYearPlaceholder')}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.monthYear?.message}
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('startTime') || (language === 'ar' ? 'وقت البدء' : 'Start Time')} *</label>
              <input
                type="time"
                defaultValue="10:00"
                onChange={(e) => {
                  const newTime = e.target.value;
                  if (newTime) {
                    setWeekDays(prev => prev.map(d => ({ ...d, time: newTime })));
                  }
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-3 text-start">
            <label className="text-sm font-medium">{t('addMultipleSessions_weekDays')} *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weekDays.map((day) => (
                <div
                  key={day.id}
                  onClick={() => setWeekDays(prev => prev.map(d => d.id === day.id ? { ...d, checked: !d.checked } : d))}
                  className={`border rounded-xl p-4 transition-all cursor-pointer ${day.checked ? 'border-primary bg-primary-50' : 'border-gray-200 hover:border-primary/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="time"
                      value={day.time}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setWeekDays(prev => prev.map(d => d.id === day.id ? { ...d, time: e.target.value } : d))}
                      disabled={!day.checked}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{t(day.nameKey)}</span>
                    </div>
                  </div>
                  {day.checked && (
                    <p className="text-[10px] text-gray-500 mt-2">{t('addMultipleSessions_endsAt')}: {calculateEndTime(day.time, watchedDuration)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {sessionPreview.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-start">{t('addMultipleSessions_preview')} ({sessionPreview.length} {t('addMultipleSessions_sessionUnit')})</h3>
              <div className="max-h-40  overflow-y-auto no-scrollbar space-y-2 px-2">
                {sessionPreview.map((s, i) => (
                  <div key={i} className="flex justify-between bg-white p-2 rounded border text-sm">
                    <span dir="ltr">{s.time}</span>
                    <span>{s.date} - {s.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90">{t('add')}</button>
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold">{t('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
