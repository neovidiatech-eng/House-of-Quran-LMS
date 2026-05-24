import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Video,
  AlertCircle,
  Calendar,
  MonitorPlay,
  AlertTriangle,
  BookOpen,
  Layers,
} from 'lucide-react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  getSessionSchema,
  getMultipleSessionsSchema,
  SessionFormData,
  MultipleSessionsPayload,
  MultipleSessionsFormData,
} from '../../lib/schemas/SessionSchema';

import CustomSelect from '../ui/CustomSelect';

import { useStudents } from '../../features/admin/hooks/useStudents';
import { useTeacher } from '../../features/admin/hooks/useTeacher';

import { Student } from '../../types/student';
import { Teacher, DayOfWeek } from '../../types/scheduales';

import { useTranslation } from 'react-i18next';

// Sub-components
import StudentPlanCard from './add-session/StudentPlanCard';
import SchedulingSettings from './add-session/SchedulingSettings';
import SessionPreview from './add-session/SessionPreview';
import ModalStyles from './add-session/ModalStyles';
import { TeacherSubject } from '../../types/teachers';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function AddSessionModal({
  isOpen,
  onClose,
  onAdd,
}: AddSessionModalProps) {
  const { t, i18n } = useTranslation();

  const language = i18n.language.split('-')[0];

  const [schedulingMode, setSchedulingMode] = useState<'single' | 'batch'>(
    'single'
  );
  const [sessionsLimitError, setSessionsLimitError] = useState('');

  const { data: students } = useStudents();
  const { data: instructors } = useTeacher();

  const singleSchema = getSessionSchema(t);
  const batchSchema = getMultipleSessionsSchema(t);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(
      schedulingMode === 'single' ? singleSchema : batchSchema
    ),
    defaultValues: {
      type: 'full',
      notification_Time: '10',
      student: '',
      teacher: '',
      subject: '',
      title: '',
      description: '',
      notes: '',
      platform: 'zoom',
      meetingLink: '',
      sessionDate: (() => {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        return tom.toISOString().split('T')[0];
      })(),
      batchStartDate: (() => {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        return tom.toISOString().split('T')[0];
      })(),
      batchEndDate: (() => {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 29);
        return nextMonth.toISOString().split('T')[0];
      })(),
      startTime: '14:00',
      endTime: '15:00',
      duration: '60',
      monthYear: new Date().toISOString().substring(0, 7),
      selectedDays: [],
      language: language === 'ar' ? 'ar' : 'en',
    },
  });

  const watchTitle = watch('title');
  const watchSubject = watch('subject');
  const watchStudent = watch('student');
  const watchType = watch('type') as 'full' | 'half';
  const watchStartTime = watch('startTime');
  const watchTeacher = watch('teacher');

  const watchSelectedDays =
    (watch('selectedDays') as DayOfWeek[]) || [];

  useEffect(() => {
    if (!watchStartTime || !watchType) return;

    const durationMinutes = watchType === 'full' ? 60 : 30;

    setValue('duration', String(durationMinutes));

    const [hours, minutes] = watchStartTime
      .split(':')
      .map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    date.setMinutes(date.getMinutes() + durationMinutes);

    const endHours = String(date.getHours()).padStart(2, '0');

    const endMinutes = String(date.getMinutes()).padStart(2, '0');

    setValue('endTime', `${endHours}:${endMinutes}`);
  }, [watchStartTime, watchType, setValue]);

  const selectedStudentData = useMemo(() => {
    if (!watchStudent || !students?.data?.studentsData) return null;

    return (
      students.data.studentsData.find(
        (s: Student) => String(s.id) === String(watchStudent)
      ) || null
    );
  }, [watchStudent, students]);

  const selectedTeacherData = useMemo(() => {
    if (!watchTeacher || !instructors?.teachers) return null;

    return (
      instructors.teachers.find(
        (t: Teacher) => String(t.id) === String(watchTeacher)
      ) || null
    );
  }, [watchTeacher, instructors]);

  const subjects: TeacherSubject[] = useMemo(() => {
    return selectedTeacherData?.teacherSubjects || [];
  }, [selectedTeacherData]);

  const subjectOptions = useMemo(() => {
    return subjects.map((subject: TeacherSubject) => ({
      value: String(subject.subject.id),
      label: language === 'ar' ? subject.subject.name_ar : (subject.subject.name_en || subject.subject.name_ar),
    }));
  }, [subjects, language]);

  useEffect(() => {
    if (selectedTeacherData) {
      setValue('meetingLink', selectedTeacherData.meeting_link || '');
    }
  }, [selectedTeacherData, setValue]);

  const studentPlanInfo = useMemo(() => {
    if (!selectedStudentData) return null;

    return {
      planName: (language === 'ar' ? selectedStudentData.plan?.name_ar : selectedStudentData.plan?.name_en) || null,
      totalSessions: selectedStudentData.sessions || 0,
      sessionsAttended:
        selectedStudentData.sessions_attended || 0,
      sessionsRemaining:
        selectedStudentData.sessions_remaining || 0,
    };
  }, [selectedStudentData]);

  const selectedSubject = useMemo(() => {
    const found = subjects.find(
      (subject: TeacherSubject) =>
        String(subject.subject.id) === String(watchSubject)
    );
    return found ? found.subject : null;
  }, [subjects, watchSubject]);

  const previewSessions = useMemo(() => {
    if (schedulingMode === 'single') {
      const singleDate = watch('sessionDate');
      if (!singleDate) return [];
      return [
        {
          date: singleDate,
          available: true,
        },
      ];
    }

    const sessions: {
      date: string;
      available: boolean;
    }[] = [];

    const startDateStr = watch('batchStartDate');
    const endDateStr = watch('batchEndDate');

    if (!startDateStr || !endDateStr || !watchSelectedDays.length) return sessions;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentDate = startDate < tomorrow ? new Date(tomorrow) : new Date(startDate);

    while (currentDate <= endDate) {
      const currentDay = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      }) as DayOfWeek;

      if (watchSelectedDays.includes(currentDay)) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');

        sessions.push({
          date: `${y}-${m}-${d}`,
          available: true,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }, [
    schedulingMode,
    watchSelectedDays,
    watch('batchStartDate'),
    watch('batchEndDate'),
    watch('sessionDate'),
  ]);

  const remainingSessions = Number(studentPlanInfo?.sessionsRemaining) || 0;
  const requestedSessionsCount = previewSessions.length;
  const sessionsExceedRemaining =
    !!selectedStudentData && requestedSessionsCount > remainingSessions;

  const sessionsLimitMessage = sessionsExceedRemaining
    ? language === 'ar'
      ? `عدد الحصص المختارة ${requestedSessionsCount} أكبر من المتبقي للطالب. المتبقي ${remainingSessions} حصة فقط.`
      : `Selected sessions (${requestedSessionsCount}) exceed the student's remaining sessions. Remaining: ${remainingSessions}.`
    : '';

  useEffect(() => {
    setSessionsLimitError(sessionsLimitMessage);
  }, [sessionsLimitMessage]);

  const formatDateCard = (date: string) => {
    if (!date) {
      return {
        month: 'N/A',
        day: 0,
      };
    }
    // Handle both YYYY-MM-DD and ISO strings safely
    const datePart = date.includes('T') ? date.split('T')[0] : date;
    const [year, month, day] = datePart.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return {
        month: 'N/A',
        day: 0,
      };
    }
    const d = new Date(year, month - 1, day);

    return {
      month: d.toLocaleDateString('en-US', {
        month: 'short',
      }),
      day: d.getDate(),
    };
  };

  const onSubmit = (data: any) => {
    if (sessionsExceedRemaining) {
      setSessionsLimitError(sessionsLimitMessage);
      return;
    }

    if (schedulingMode === 'single') {
      onAdd(data as SessionFormData);
    } else {
      const batchData: MultipleSessionsPayload = {
        formData: data as MultipleSessionsFormData,
        selectedDays: watchSelectedDays,
        sessions: previewSessions.map((session) => ({
          date: session.date,
          day: new Date(session.date + 'T00:00:00').toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
            }
          ) as DayOfWeek,
          time: data.startTime,
        })),
      };

      onAdd(batchData);
    }

    reset();

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] max-h-[92vh] overflow-hidden bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Create New Session
              </h2>

              <p className="text-sm text-gray-400">
                Configure and schedule sessions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row overflow-hidden"
        >
          <input type="hidden" {...register('type')} />

          {/* LEFT */}
          <div className="w-full lg:w-[58%] p-8 overflow-y-auto custom-scrollbar">

            {/* Student + Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Student */}
              <div>
                <label className="label">
                  <Search className="w-3.5 h-3.5" />
                  {t('studentLabel') || 'Student'}
                </label>

                <Controller
                  name="student"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={
                        students?.data?.studentsData?.map(
                          (student: Student) => ({
                            value: String(student.id),
                            label: student.user.name,
                          })
                        ) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('selectStudent') || 'Select Student'}
                    />
                  )}
                />

                {errors.student && (
                  <p className="error-text">
                    {errors.student.message as string}
                  </p>
                )}
              </div>

              {/* Teacher */}
              <div>
                <label className="label">
                  <Search className="w-3.5 h-3.5" />
                  {t('teacherLabel') || 'Instructor'}
                </label>

                <Controller
                  name="teacher"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={
                        instructors?.teachers?.map(
                          (teacher: Teacher) => ({
                            value: String(teacher.id),
                            label: teacher.user.name,
                          })
                        ) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('selectTeacher') || 'Select Instructor'}
                    />
                  )}
                />

                {errors.teacher && (
                  <p className="error-text">
                    {errors.teacher.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Plan Card */}
            <StudentPlanCard studentPlanInfo={studentPlanInfo} />

            {/* Title */}
            <div className="mb-6">
              <label className="label">
                <Video className="w-3.5 h-3.5" />
                {t('sessionTitleLabel') || 'Session Title'}
              </label>

              <input
                type="text"
                {...register('title')}
                placeholder={t('sessionTitlePlaceholder') || 'Session Title'}
                className="input"
              />

              {errors.title && (
                <p className="error-text">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="label">
                <AlertCircle className="w-3.5 h-3.5" />
                {t('description') || 'Description'}
              </label>

              <textarea
                {...register('description')}
                placeholder={t('descriptionPlaceholder') || 'Description...'}
                className="textarea"
              />

              {errors.description && (
                <p className="error-text">
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* Subject + Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Subject */}
              <div>
                <label className="label">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t('subjectLabel') || 'Subject'}
                </label>

                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={subjectOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('selectSubject') || 'Select Subject'}
                    />
                  )}
                />

                {errors.subject && (
                  <p className="error-text">
                    {errors.subject.message as string}
                  </p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="label">
                  <Layers className="w-3.5 h-3.5" />
                  Language
                </label>

                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'ar', label: 'Arabic' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <SchedulingSettings
              schedulingMode={schedulingMode}
              setSchedulingMode={setSchedulingMode}
              register={register}
              watchSelectedDays={watchSelectedDays}
              setValue={setValue}
              DAYS={DAYS}
              control={control}
            />

            {/* Meeting Link */}
            <div className="grid grid-cols-1 gap-5 mb-6">
              <div>
                <label className="label">
                  <MonitorPlay className="w-3.5 h-3.5" />
                  {t('meetingLink') || 'Meeting Link'}
                </label>

                <input
                  type="url"
                  {...register('meetingLink')}
                  placeholder="https://zoom.us/j/..."
                  className="input"
                />

                {errors.meetingLink && (
                  <p className="error-text">
                    {errors.meetingLink.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="label">
                <AlertTriangle className="w-3.5 h-3.5" />
                Notes
              </label>

              <textarea
                {...register('notes')}
                placeholder="Private notes..."
                className="textarea"
              />
            </div>



            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4">

              <button
                type="button"
                onClick={onClose}
                className="secondary-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={sessionsExceedRemaining}
                className={`primary-btn ${sessionsExceedRemaining ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {schedulingMode === 'single'
                  ? 'Create Session'
                  : 'Schedule Batch'}
              </button>
            </div>
          </div>

          <SessionPreview
            previewSessions={previewSessions}
            formatDateCard={formatDateCard}
            watchTitle={watchTitle}
            selectedSubject={selectedSubject}
            watchStartTime={watchStartTime}
            sessionsLimitError={sessionsLimitError}
            requestedSessionsCount={requestedSessionsCount}
            remainingSessions={remainingSessions}
          />
        </form>

        <ModalStyles />
      </div>
    </div>
  );
}
