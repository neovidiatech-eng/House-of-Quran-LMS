import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { AssignmentFormData, getAssignmentSchema } from '../../lib/schemas/AssignmentSchema';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetStudents, useGetSubjects, useCreateAssignment, useUpdateAssignment } from '../../hooks/useAssignment';
import { Assignment } from '../../types/assignment';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Assignment | null;
}

export default function AddAssignmentModal({ isOpen, onClose, initialData }: AddAssignmentModalProps) {
  const { language, t } = useLanguage();

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents();
  const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjects();

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const studentsOptions = (studentsData?.data?.studentsData || []).map(s => ({
    value: s.id,
    label: s.user?.name || s.id
  }));

  const subjectsOptions = (subjectsData?.subjects || []).map(s => ({
    value: s.id,
    label: language === 'ar' ? s.name_ar : s.name_en || s.name_ar
  }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(getAssignmentSchema(t)) as Resolver<AssignmentFormData>,
    defaultValues: {
      status: 'pending',
    },
  });

  const text = {
    title: { ar: initialData ? 'تعديل الواجب' : 'إضافة واجب جديد', en: initialData ? 'Edit Assignment' : 'Add New Assignment' },
    student: { ar: 'اختر الطالب', en: 'Select Student' },
    subject: { ar: 'المادة', en: 'Subject' },
    assignmentTitle: { ar: 'العنوان', en: 'Title' },
    description: { ar: 'الوصف', en: 'Description' },
    dueDate: { ar: 'تاريخ التسليم', en: 'Due Date' },
    status: { ar: 'الحالة', en: 'Status' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    submitted: { ar: 'تم التسليم', en: 'Submitted' },
    graded: { ar: 'تم التصحيح', en: 'Graded' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    submit: { ar: initialData ? 'تعديل' : 'إضافة', en: initialData ? 'Update' : 'Add' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...' }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          studentId: initialData.studentId || initialData.student?.id || '',
          subjectId: initialData.subjectId || initialData.subject?.id || '',
          title: initialData.title || '',
          description: initialData.description || '',
          dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
          status: (initialData.status as any) || 'pending',
        });
      } else {
        reset({
          studentId: '',
          subjectId: '',
          title: '',
          description: '',
          dueDate: '',
          status: 'pending',
        });
      }
    }
  }, [initialData, reset, isOpen]);

  const handleOnSubmit = (data: AssignmentFormData) => {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...data } as any, {
        onSuccess: () => {
          onClose();
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleOnSubmit)} className="p-6 space-y-4" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label={text.student[language]}
                value={watch('studentId')}
                onChange={(val) => setValue('studentId', val, { shouldValidate: true })}
                options={studentsOptions}
                disabled={isLoadingStudents}
                placeholder={isLoadingStudents ? text.loading[language] : text.student[language]}
              />
              {errors.studentId && <p className="text-red-500 text-xs mt-1 text-start">{errors.studentId.message}</p>}
            </div>

            <div>
              <CustomSelect
                label={text.subject[language]}
                value={watch('subjectId')}
                onChange={(val) => setValue('subjectId', val, { shouldValidate: true })}
                options={subjectsOptions}
                disabled={isLoadingSubjects}
                placeholder={isLoadingSubjects ? text.loading[language] : text.subject[language]}
              />
              {errors.subjectId && <p className="text-red-500 text-xs mt-1 text-start">{errors.subjectId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.assignmentTitle[language]}
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start"
              dir="rtl"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 text-start">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.description[language]}
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start resize-none"
              dir="rtl"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 text-start">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <DatePickerField
                label={text.dueDate[language]}
                value={watch('dueDate')}
                onChange={(val) => setValue('dueDate', val, { shouldValidate: true })}
                error={errors.dueDate?.message}
              />
            </div>
            <CustomSelect
              label={text.status[language]}
              value={watch('status')}
              onChange={(val) => setValue('status', val as 'pending' | 'submitted' | 'graded', { shouldValidate: true })}
              options={[
                { value: 'pending', label: text.pending[language] },
                { value: 'submitted', label: text.submitted[language] },
                { value: 'graded', label: text.graded[language] }
              ]}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) ? text.loading[language] : text.submit[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
