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
  Bell,
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
import { useStudentsModerators } from '../../features/supervisor/hooks/useStudentsModerators';
import { useTeacher } from '../../features/admin/hooks/useTeacher';

import { Student } from '../../types/student';
import { Teacher } from '../../types/teachers';
import { DayOfWeek } from '../../types/scheduales';

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
  onAdd: (data: any) => Promise<{ conflicts?: { date: string; conflict: string }[]; skipedSchedules?: { date: string; conflict: string }[] } | void>;
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
  const [apiConflicts, setApiConflicts] = useState<{date: string, conflict: string}[]>([]);

  const role = localStorage.getItem('role');
  const isModerator = role === 'moderator' || role === 'supervisor';

  const { data: allStudents } = useStudents({ limit: 1000 }, { enabled: !isModerator });
  const { data: modStudents } = useStudentsModerators({ enabled: isModerator });
  const students: any = isModerator ? modStudents : allStudents;

  const studentsList: Student[] = useMemo(() => {
    if (isModerator) {
      const items = students?.data?.students?.items || [];
      return items.map((i: any) => i.student).filter(Boolean);
    } else {
      return students?.data?.studentsData || students?.data?.students || students?.data || [];
    }
  }, [students, isModerator]);

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
  const watchEndTime = watch('endTime');
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

  const isGroupPlanStudent = (student?: Student | null) =>
    Boolean(
      student?.plan &&
      (student.plan.planType === 'group' ||
        student.plan.name_ar?.includes('جماعية') ||
        student.plan.name_en?.toLowerCase().includes('group'))
    );

  const selectedStudentData = useMemo(() => {
    const list = studentsList;
    if (!watchStudent || !list) return null;
    const firstId = Array.isArray(watchStudent) ? watchStudent[0] : watchStudent;
    return list.find((s: Student) => String(s.id) === String(firstId)) || null;
  }, [watchStudent, studentsList]);

  const isGroupPlan = isGroupPlanStudent(selectedStudentData);

  const maxStudentsCount = useMemo(() => {
    if (!isGroupPlan || !selectedStudentData?.plan) return 0;
    const rawMax = selectedStudentData.plan.maxStudents ?? (selectedStudentData.plan as any).studentsNum;
    if (!rawMax || rawMax === 'unlimited' || rawMax === '0') return 0;
    const parsed = parseInt(String(rawMax), 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [isGroupPlan, selectedStudentData]);

  const selectedStudentIds = useMemo(() => {
    if (!watchStudent) return [];
    return Array.isArray(watchStudent) ? watchStudent.map(String) : [String(watchStudent)];
  }, [watchStudent]);

  const studentOptions = useMemo(() => {
    const list = studentsList;
    if (!list) return [];

    const isReachedMax = maxStudentsCount > 0 && selectedStudentIds.length >= maxStudentsCount;

    return list.map((student: Student) => {
      const planName = (language === 'ar' ? student.plan?.name_ar : student.plan?.name_en) || '';
      const isGroup = isGroupPlanStudent(student);
      const isSelected = selectedStudentIds.includes(String(student.id));

      let badge = planName ? ` (${planName})` : '';
      let disabled = false;

      if (isGroupPlan) {
        if (!isGroup) {
          disabled = true;
          badge = planName
            ? ` (${planName} - ${language === 'ar' ? 'غير متاح' : 'Unavailable'})`
            : ` (${language === 'ar' ? 'خطة فردية - غير متاح' : 'Single Plan - Unavailable'})`;
        } else if (isReachedMax && !isSelected) {
          disabled = true;
          badge = planName
            ? ` (${planName} - ${language === 'ar' ? 'الحد الأقصى ممتلئ' : 'Max Limit Full'})`
            : ` (${language === 'ar' ? 'الحد الأقصى ممتلئ' : 'Max Limit Full'})`;
        }
      }

      return {
        value: String(student.id),
        label: `${student.user?.name || t('noName')}${badge}`,
        searchText: `${student.user?.name || ''} ${student.user?.email || ''}`,
        disabled,
      };
    });
  }, [studentsList, language, isGroupPlan, maxStudentsCount, selectedStudentIds]);

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
    return subjects.map((subject: TeacherSubject) => {
      const name = language === 'ar' ? subject.subject.name_ar : (subject.subject.name_en || subject.subject.name_ar);
      return {
        value: String(subject.subject.id),
        label: name,
        searchText: name,
      };
    });
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

  const [customSessionMap, setCustomSessionMap] = useState<Record<string, { date?: string; time?: string; endTime?: string; deleted?: boolean }>>({});

  const selectedSubject = useMemo(() => {
    const found = subjects.find(
      (subject: TeacherSubject) =>
        String(subject.subject.id) === String(watchSubject)
    );
    return found ? found.subject : null;
  }, [subjects, watchSubject]);

  const defaultSessions = useMemo(() => {
    const defaultTime = watchStartTime || '14:00';
    const defaultEndTime = watchEndTime || '15:00';

    if (schedulingMode === 'single') {
      const singleDate = watch('sessionDate');
      if (!singleDate) return [];
      return [
        {
          id: `single-${singleDate}`,
          originalDate: singleDate,
          date: singleDate,
          time: defaultTime,
          endTime: defaultEndTime,
          available: true,
        },
      ];
    }

    const sessions: {
      id: string;
      originalDate: string;
      date: string;
      time: string;
      endTime: string;
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

    let index = 0;
    while (currentDate <= endDate) {
      const currentDay = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      }) as DayOfWeek;

      if (watchSelectedDays.includes(currentDay)) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        sessions.push({
          id: `batch-${dateStr}-${index}`,
          originalDate: dateStr,
          date: dateStr,
          time: defaultTime,
          endTime: defaultEndTime,
          available: true,
        });
        index++;
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
    watchStartTime,
    watchEndTime,
  ]);

  const previewSessions = useMemo(() => {
    return defaultSessions
      .filter((s) => !customSessionMap[s.id]?.deleted)
      .map((s) => {
        const custom = customSessionMap[s.id];
        const date = custom?.date || s.date;
        const time = custom?.time || s.time;
        const endTime = custom?.endTime || s.endTime;
        const isCustomized =
          date !== s.originalDate ||
          time !== (watchStartTime || '14:00') ||
          endTime !== (watchEndTime || '15:00');
        return {
          ...s,
          date,
          time,
          endTime,
          isCustomized,
        };
      });
  }, [defaultSessions, customSessionMap, watchStartTime, watchEndTime]);

  const hasCustomizations = useMemo(() => {
    return (
      Object.keys(customSessionMap).length > 0 &&
      Object.values(customSessionMap).some(
        (val) => val.date || val.time || val.endTime || val.deleted
      )
    );
  }, [customSessionMap]);

  const handleUpdateSession = (id: string, newDate: string, newStartTime: string, newEndTime?: string) => {
    setCustomSessionMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        date: newDate,
        time: newStartTime,
        endTime: newEndTime,
      },
    }));
    // Clear conflicts when user modifies a session (conflict may be resolved)
    setApiConflicts([]);
  };

  const handleDeleteSession = (id: string) => {
    setCustomSessionMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        deleted: true,
      },
    }));
    // Remove conflict for deleted session
    setApiConflicts((prev) => prev.filter((c) => {
      const session = previewSessions.find((s) => s.id === id);
      return session ? c.date !== session.date : true;
    }));
  };

  const handleResetSessions = () => {
    setCustomSessionMap({});
    setApiConflicts([]);
  };

  const remainingSessions = Number(studentPlanInfo?.sessionsRemaining) || 0;
  const requestedSessionsCount = previewSessions.length;
  const sessionsExceedRemaining =
    !!selectedStudentData && requestedSessionsCount > remainingSessions;

  const sessionsLimitMessage = sessionsExceedRemaining
    ? t('addSession_sessionsLimitMessage', {
      requestedSessionsCount,
      remainingSessions,
    })
    : '';

  useEffect(() => {
    setSessionsLimitError(sessionsLimitMessage);
  }, [sessionsLimitMessage]);

  const formatDateCard = (date: string) => {
    if (!date) {
      return {
        month: '-',
        day: 0,
      };
    }
    const datePart = date.includes('T') ? date.split('T')[0] : date;
    const [year, month, day] = datePart.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return {
        month: '-',
        day: 0,
      };
    }
    const d = new Date(year, month - 1, day);

    return {
      month: d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
      }),
      day: d.getDate(),
    };
  };

  const onSubmit = async (data: any) => {
    if (sessionsExceedRemaining) {
      setSessionsLimitError(sessionsLimitMessage);
      return;
    }

    let result;
    if (schedulingMode === 'single') {
      result = await onAdd(data as SessionFormData);
    } else {
      const batchData: MultipleSessionsPayload & {
        isCustomized?: boolean;
        originalGeneratedCount?: number;
      } = {
        formData: data as MultipleSessionsFormData,
        selectedDays: watchSelectedDays,
        originalGeneratedCount: defaultSessions.length,
        isCustomized: hasCustomizations,
        sessions: previewSessions.map((session) => ({
          date: session.date,
          day: new Date(session.date + 'T00:00:00').toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
            }
          ) as DayOfWeek,
          time: session.time || data.startTime,
        })),
      };

      result = await onAdd(batchData);
    }

    const conflicts = result?.conflicts || result?.skipedSchedules;
    if (conflicts && conflicts.length > 0) {
      setApiConflicts(conflicts);
      return; // Do not close modal, so user can fix conflicts
    }

    reset();
    setCustomSessionMap({});
    setApiConflicts([]);
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
                {t('addSingleSession_title')}
              </h2>

              <p className="text-sm text-gray-400">
                {t('addSession_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setApiConflicts([]);
              onClose();
            }}
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
              <div className={isGroupPlan ? "sm:col-span-2" : ""}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">
                    <Search className="w-3.5 h-3.5" />
                    {t('studentLabel') || (language === 'ar' ? 'الطالب' : 'Student')}
                  </label>
                  {isGroupPlan && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {language === 'ar'
                        ? `خطة جماعية (المحدد ${selectedStudentIds.length}${maxStudentsCount > 0 ? ` من ${maxStudentsCount}` : ''})`
                        : `Group Plan (${selectedStudentIds.length}${maxStudentsCount > 0 ? ` of ${maxStudentsCount}` : ''} selected)`
                      }
                    </span>
                  )}
                </div>

                <Controller
                  name="student"
                  control={control}
                  render={({ field }) => {
                    const selectValue = isGroupPlan
                      ? (Array.isArray(field.value) ? field.value : (field.value ? [String(field.value)] : []))
                      : (Array.isArray(field.value) ? field.value[0] || '' : field.value || '');

                    return (
                      <CustomSelect
                        mode={isGroupPlan ? "multiple" : undefined}
                        options={studentOptions}
                        value={selectValue}
                        onChange={(val) => {
                          if (isGroupPlan) {
                            let arr = Array.isArray(val) ? val.map(String) : [String(val)];
                            // Only allow students subscribed to a group plan
                            arr = arr.filter((id) => {
                              const s = studentsList?.find((st: Student) => String(st.id) === id);
                              return isGroupPlanStudent(s);
                            });
                            // Limit to maxStudentsCount if specified
                            if (maxStudentsCount > 0 && arr.length > maxStudentsCount) {
                              arr = arr.slice(0, maxStudentsCount);
                            }
                            field.onChange(arr);
                          } else {
                            field.onChange(Array.isArray(val) ? val[0] || '' : val);
                          }
                        }}
                        placeholder={
                          isGroupPlan
                            ? (language === 'ar' ? 'اختر الطلاب المشتركين في الباقة الجماعية' : 'Select Group Plan Students')
                            : (t('selectStudent') || 'Select Student')
                        }
                      />
                    );
                  }}
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
                            searchText: teacher.user.name,

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
                  {t('language')}
                </label>

                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={[
                        { value: 'en', label: t('english') },
                        { value: 'ar', label: t('arabic') },
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

            {/* Meeting Link & Notification */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
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

              <div>
                <label className="label">
                  <Bell className="w-3.5 h-3.5" />
                  {t('notificationTime')}
                </label>

                <Controller
                  name="notification_Time"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={[
                        { value: '10', label: language === 'ar' ? 'قبل 10 دقائق' : '10 minutes before' },
                        { value: '30', label: language === 'ar' ? 'قبل 30 دقيقة' : '30 minutes before' },
                        { value: '60', label: language === 'ar' ? 'قبل ساعة' : '1 hour before' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div> */}

            {/* Notes */}
            <div className="mb-6">
              <label className="label">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('notes')}
              </label>

              <textarea
                {...register('notes')}
                placeholder={t('addSession_privateNotesPlaceholder')}
                className="textarea"
              />
            </div>



            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4">

              <button
                type="button"
                onClick={() => {
                  setApiConflicts([]);
                  onClose();
                }}
                className="secondary-btn"
              >
                {t('cancel')}
              </button>

              <button
                type="submit"
                disabled={sessionsExceedRemaining || (schedulingMode === 'batch' && apiConflicts.length > 0)}
                className={`primary-btn ${
                  sessionsExceedRemaining || (schedulingMode === 'batch' && apiConflicts.length > 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                title={
                  schedulingMode === 'batch' && apiConflicts.length > 0
                    ? (language === 'ar'
                        ? 'يرجى حل تعارضات المواعيد قبل المتابعة'
                        : 'Please resolve schedule conflicts before proceeding')
                    : undefined
                }
              >
                {schedulingMode === 'single'
                  ? t('addSession_create')
                  : t('addSession_scheduleBatch')}
              </button>
            </div>
          </div>

          <SessionPreview
            previewSessions={previewSessions}
            formatDateCard={formatDateCard}
            watchTitle={watchTitle}
            selectedSubject={selectedSubject}
            watchStartTime={watchStartTime}
            watchEndTime={watchEndTime}
            sessionsLimitError={sessionsLimitError}
            requestedSessionsCount={requestedSessionsCount}
            remainingSessions={remainingSessions}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            onResetSessions={handleResetSessions}
            hasCustomizations={hasCustomizations}
            apiConflicts={apiConflicts}
          />
        </form>

        <ModalStyles />
      </div>
    </div>
  );
}
