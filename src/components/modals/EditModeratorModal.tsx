import { useState, useMemo, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, UserCheck, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import { useForm, Controller } from 'react-hook-form';
import { DEFAULT_COUNTRIES } from '../../consts/countries';
import { useStudents } from '../../features/admin/hooks/useStudents';
import { Moderator, UpdateModeratorInput } from '../../types/moderator';

interface EditModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moderator: Moderator | null;
  onSubmit: (id: string, data: UpdateModeratorInput) => Promise<void>;
}

interface FormValues {
  name: string;
  email: string;
  codeCountry: string;
  phone: string;
  password?: string;
  age?: string;
  gender: 'male' | 'female';
  studentIds?: string[];
  status: 'active' | 'inactive' | string;
}

export default function EditModeratorModal({
  isOpen,
  onClose,
  moderator,
  onSubmit,
}: EditModeratorModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentsResponse } = useStudents({ limit: 100 }) as any;
  const students = studentsResponse?.data?.studentsData || [];

  const defaultStudentIds = useMemo(() => {
    return moderator?.studentModerators?.map((sm) => sm.studentId) || [];
  }, [moderator]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: moderator?.user?.name || '',
      email: moderator?.user?.email || '',
      codeCountry: moderator?.user?.code_country || '+20',
      phone: moderator?.user?.phone || '',
      password: '',
      age: '',
      gender: (moderator?.gender as 'male' | 'female') || 'male',
      studentIds: defaultStudentIds,
      status: moderator?.status || 'active',
    },
  });

  useEffect(() => {
    if (moderator) {
      reset({
        name: moderator.user?.name || '',
        email: moderator.user?.email || '',
        codeCountry: moderator.user?.code_country || '+20',
        phone: moderator.user?.phone || '',
        password: '',
        age: '',
        gender: (moderator.gender as 'male' | 'female') || 'male',
        studentIds: moderator.studentModerators?.map((sm) => sm.studentId) || [],
        status: moderator.status || 'active',
      });
    }
  }, [moderator, reset]);

  const displayNames = useMemo(() => {
    return new Intl.DisplayNames([language === 'ar' ? 'ar' : 'en'], { type: 'region' });
  }, [language]);

  const countryCodeOptions = useMemo(() => {
    const unique = Array.from(
      new Map(DEFAULT_COUNTRIES.map((c) => [`+${c.phone_code}`, c])).values()
    );
    return unique.map((c) => ({
      value: `+${c.phone_code}`,
      searchText: `${displayNames.of(c.iso2) || c.name} +${c.phone_code}`,
      label: (
        <div className="flex justify-between items-center w-full">
          <span className="font-mono">+{c.phone_code}</span>
          <span className="text-gray-500 text-xs">{c.emoji} {displayNames.of(c.iso2) || c.name}</span>
        </div>
      ),
    }));
  }, [displayNames]);

  const studentOptions = useMemo(() => {
    return students.map((s: any) => ({
      value: s.id,
      searchText: `${s.user?.name || ''} ${s.user?.email || ''} ${s.user?.phone || ''}`,
      label: (
        <div className="flex justify-between items-center w-full py-0.5">
          <span className="font-medium text-gray-800">{s.user?.name || s.id}</span>
          <span className="text-xs text-gray-400">{s.user?.email || s.country || ''}</span>
        </div>
      ),
    }));
  }, [students]);

  const onFormSubmit = async (values: FormValues) => {
    if (!moderator) return;
    try {
      setIsSubmitting(true);
      const payload: UpdateModeratorInput = {
        name: values.name.trim(),
        email: values.email.trim(),
        codeCountry: values.codeCountry,
        phone: values.phone.trim(),
        gender: values.gender,
        studentIds: values.studentIds || [],
        status: values.status,
      };
      if (values.password && values.password.trim()) {
        payload.password = values.password.trim();
      }
      if (values.age) {
        payload.age = Number(values.age);
      }
      await onSubmit(moderator.id, payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !moderator) return null;

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('editModerator') || 'تعديل بيانات المشرف'}</h3>
              <p className="text-xs text-gray-500">{moderator.user?.name} - {moderator.user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('name')}
                {...register('name', { required: t('nameRequired') || 'الاسم مطلوب' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                {...register('email', {
                  required: t('emailRequired') || 'البريد الإلكتروني مطلوب',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('invalidEmail') || 'بريد إلكتروني غير صالح',
                  },
                })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone Country Code & Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Controller
                    name="codeCountry"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        options={countryCodeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('countryCode')}
                      />
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="tel"
                    placeholder="1000000000"
                    {...register('phone', { required: t('phoneRequired') || 'رقم الهاتف مطلوب' })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
                  />
                </div>
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password (Optional for Edit) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')} <span className="text-gray-400 font-normal text-xs">({t('optional') || 'اختياري في حال التغيير'})</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('age') || 'العمر'}
              </label>
              <input
                type="number"
                min="18"
                max="100"
                placeholder="25"
                {...register('age')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
              />
            </div>

            {/* Gender */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gender') || 'النوع'} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="gender"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomSelect
                    options={[
                      { value: 'male', label: t('male') || 'ذكر' },
                      { value: 'female', label: t('female') || 'أنثى' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Status */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('status') || 'الحالة'} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomSelect
                    options={[
                      { value: 'active', label: t('active') || 'نشط' },
                      { value: 'inactive', label: t('inactive') || 'غير نشط' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Assign Students */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{t('assignStudents') || 'إسناد الطلاب'}</span>
              </label>
              <Controller
                name="studentIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    mode="multiple"
                    options={studentOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('selectStudents') || 'اختر الطلاب المسندين لهذا المشرف...'}
                    className="w-full h-full"
                  />
                )}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium text-sm shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (t('saving') || 'جاري الحفظ...') : (t('save') || 'حفظ التعديلات')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
