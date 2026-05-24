import { useState } from 'react';
import { X, GraduationCap, Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { Plan } from '../../types/plan';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData) => void;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: plansData } = usePlans();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(getStudentSchema(t)),
    defaultValues: {
      phone_code: '+20',
      status: 'approved',
      gender: '',
      plan: '',
      country: 'مصر'
    }
  });
  const onFormSubmit = (data: StudentFormData) => {
    onSubmit({
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const countryCodes = [
    { code: '+20', country: t('egypt') },
    { code: '+966', country: t('saudiArabia') },
    { code: '+971', country: t('uae') },
    { code: '+965', country: t('kuwait') },
  ];

  const plans = plansData || [];

  const planOptions = [
    { value: '', label: t('noPlan') },
    ...plans.map((p: Plan) => ({
      value: p.id,
      label: language === 'ar' ? p.name_ar : p.name_en,
    }))
  ];

  const genderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
  ];

  const countryOptions = [
    { value: 'egypt', label: t('egypt') },
    { value: 'saudi', label: t('saudiArabia') },
    { value: 'uae', label: t('uae') },
    { value: 'kuwait', label: t('kuwait') },
  ];

  const statusOptions = [
    { value: 'approved', label: t('active') },
    { value: 'pending', label: t('pending') },
    { value: 'rejected', label: t('rejected') },
  ];

  const countryCodeOptions = countryCodes.map((c) => ({
    value: c.code,
    searchText: `${c.country} ${c.code}`,
    label: (
      <div className="flex justify-between items-center w-full">
        <span className="font-mono">{c.code}</span>
        <span className="text-gray-500 text-xs">{c.country}</span>
      </div>
    ),
  }));

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl">

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            <span>{t('addNewStudent')}</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="ex :- Mohamed"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  required
                  {...register('email')}
                  placeholder="ex :- student@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Row 2: Phone and Country Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="ex :- 01091536978"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <Controller
                name="phone_code"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('countryCode')}
                    value={field.value}
                    options={countryCodeOptions}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Row 3: Gender and Birth Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerField
                      label={t('birthDate')}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('gender')}
                    value={field.value}
                    options={genderOptions}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Row 4: Plan and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('country')}
                    value={field.value}
                    options={countryOptions}
                    placeholder={t('selectCountry')}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="plan"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('studyPlan')}
                    value={field.value}
                    options={planOptions}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Row 5: Password and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full px-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start bg-gray-50 transition-all"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('status')}
                    value={field.value}
                    options={statusOptions}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
