import { X, Users, Eye, EyeOff, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import { TeacherFormData, getTeacherSchema } from '../../lib/schemas/TeacherSchema';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Teacher } from '../../types/teachers';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { useSubjects } from '../../features/admin/hooks/useSubjects';
import { CustomCheckbox } from '../ui/CustomCheckbox';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacherData: TeacherFormData) => void;
  teacher: Teacher | null;
}

export default function EditTeacherModal({ isOpen, onClose, onSubmit, teacher }: EditTeacherModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: currenciesData } = useCurrency();
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects();

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors }, } = useForm<TeacherFormData>({
    resolver: zodResolver(getTeacherSchema(t)) as Resolver<TeacherFormData>,
  });

  const currencyOptions = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies.map(c => ({
      value: c.id,
      label: language === 'ar' ? `${c.name_ar} (${c.symbol})` : `${c.name_en} (${c.code})`
    }));
  }, [currenciesData, language]);

  useEffect(() => {
    if (teacher) {
      console.log("==> EditTeacherModal Mount:", teacher);

      // Extract subject IDs directly from the API response
      const subjectsArray = teacher.teacherSubjects || [];
      const subjectIds = subjectsArray.map((s: any) => String(s.subjectId || s.subject?.id)).filter(Boolean);

      const currencyId = teacher.currencyId || '';

      console.log("==> Extracted Data:", { subjectIds, currencyId });

      reset({
        name: teacher.user?.name || '',
        email: teacher.user?.email || '',
        phone: teacher.user?.phone || '',
        password: '',
        hourlyRate: teacher.hour_price || 0,
        currency: currencyId,
        gender: (teacher.gender?.toLowerCase() as 'male' | 'female') || 'male',
        status: teacher.active ? 'active' : 'inactive',
        subjects: subjectIds,
        meeting_link: teacher.meeting_link || '',
      });
    }
  }, [teacher, reset]);

  const handleOnSubmit = (data: TeacherFormData) => {
    onSubmit(data);
    onClose();
  };

  if (!isOpen || !teacher) return null;
  const subjectsValue = watch('subjects') || [];

  const handleSubjectToggle = (id: string, checked: boolean) => {
    if (checked) {
      setValue('subjects', [...subjectsValue, id], { shouldValidate: true });
    } else {
      setValue('subjects', subjectsValue.filter(s => s !== id), { shouldValidate: true });
    }
  };

  const genders = [
    { id: 'male', label: 'ذكر', labelEn: 'Male' },
    { id: 'female', label: 'أنثى', labelEn: 'Female' },
  ];

  const statuses = [
    { id: 'active', label: 'نشط', labelEn: 'Active' },
    { id: 'inactive', label: 'غير نشط', labelEn: 'Inactive' },
  ];

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            <span>{t('editTeacher')}</span>
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleOnSubmit)} className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Name */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'الاسم' : 'Name'}
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>

            {/* Row 2: Password and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="text-start relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full px-12 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start bg-gray-50 transition-all"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                <p className="text-xs text-gray-500 mt-1 text-start">
                  {t('leaveBlankPassword')}
                </p>
              </div>

              {/* Phone */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phoneNumber')} *
                </label>
                <input
                  type="tel"
                  placeholder="01012345678"
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Row 3: Hourly Rate and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currency */}
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('currency')}
                    value={field.value}
                    options={currencyOptions}
                    onChange={field.onChange}
                  />
                )}
              />

              {/* Hourly Rate */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('hourlyRate')}
                </label>
                <input
                  type="number"
                  placeholder="150"
                  {...register('hourlyRate')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  dir="ltr"
                />
                {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate.message}</p>}
              </div>
            </div>

            {/* Row 4: Gender and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('status')}
                    value={field.value}
                    options={statuses.map(s => ({ value: s.id, label: language === 'ar' ? s.label : s.labelEn }))}
                    onChange={field.onChange}
                  />
                )}
              />
              {/* Gender */}
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('gender')}
                    value={field.value}
                    options={genders.map(g => ({ value: g.id, label: language === 'ar' ? g.label : g.labelEn }))}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Row 5: Zoom Link */}
            <div className="grid grid-cols-1 md:grid-cols-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('zoomLink')}
              </label>
              <input
                type="text"
                placeholder="https://zoom.us/j/123456789"
                {...register('meeting_link')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
              />
              {errors.meeting_link && <p className="text-red-500 text-xs mt-1">{errors.meeting_link.message}</p>}
            </div>

            {/* Subjects */}
            <div className="text-start">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('subject')}
              </label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {isLoadingSubjects ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {(subjectsData?.subjects || []).map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded-lg transition-colors"
                      >
                        <CustomCheckbox
                          checked={subjectsValue.includes(subject.id)}
                          onChange={(checked) => handleSubjectToggle(subject.id, checked)}
                        />
                        <span className="text-sm text-gray-700 flex-1 text-start">
                          {language === 'ar' ? subject.name_ar : (subject.name_en || subject.name_ar)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {errors.subjects && <p className="text-red-500 text-xs mt-2">{errors.subjects.message}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium bg-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
