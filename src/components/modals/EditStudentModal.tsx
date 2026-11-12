import { X, GraduationCap, Eye, EyeOff, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { DEFAULT_COUNTRIES } from '../../consts/countries';
import { useGetCities } from '../../features/teacher/hooks/useCity';

type EditStudentFormData = StudentFormData;

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: EditStudentFormData & { id: string }) => Promise<void>;
  studentData: (EditStudentFormData & { id: string }) | null;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  onSubmit,
  studentData,
}: EditStudentModalProps) {
  const { language, t } = useLanguage();
  const { data: plansData } = usePlans();
  const [countryCodes] = useState<Array<{ name: string; phone_code: string; emoji?: string; iso2: string }>>(DEFAULT_COUNTRIES);

  const { control, handleSubmit, register, reset, watch, formState: { errors, dirtyFields } } = useForm<EditStudentFormData>({
    resolver: zodResolver(getStudentSchema(t)),
    defaultValues: studentData || undefined,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && studentData) {
      reset(studentData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentData?.id]);



  const handleEditSubmit = async (data: EditStudentFormData) => {
    if (!studentData) return;
    const payload: any = { ...data, id: studentData.id };
    if (!dirtyFields.email) {
      delete payload.email;
    }
    await onSubmit(payload);
    onClose();
  };
  const uniqueCountryCodes = Array.from(
    new Map(countryCodes.map((c) => [`+${c.phone_code}`, c])).values()
  );



  const selectedCountry = watch("country");
  const { data: citiesData } = useGetCities(selectedCountry === 'مصر' ? 'eg' : selectedCountry?.toLowerCase() || 'eg');
  const cityOptions = citiesData ? citiesData.map((city: any) => ({
    value: city.name,
    label: city.name
  })) : [];

  const displayNames = new Intl.DisplayNames([language === 'ar' ? 'ar' : 'en'], { type: 'region' });

  const countryOptions = DEFAULT_COUNTRIES.map((country) => ({
  value: country.iso2,
  label: (
    <div className="flex items-center gap-2">
      <span>{country.emoji}</span>
      <span>{displayNames.of(country.iso2) || country.name}</span>
    </div>
  ),
}));

const nationalityOptions = DEFAULT_COUNTRIES.map((country) => ({
  value: country.nationality,
  label: country.nationality,
}));

  const countryCodeOptions = uniqueCountryCodes.map((c) => ({
    value: `+${c.phone_code}`,
    label: (
      <div className="flex justify-between items-center w-full" dir="ltr">
        <span className="font-mono">+{c.phone_code}</span>
        <span className="text-gray-500 text-xs">{displayNames.of(c.iso2) || c.name}</span>
      </div>
    ),
  }));

  const genderOptions = [
    { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
    { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' },
  ];



  const planOptions = [
    ...(plansData || []).map((p: any) => ({
      value: p.id,
      label: language === 'ar' ? p.name_ar : p.name_en,
    }))
  ];

  const statusOptions = [
    { value: 'approved', label: language === 'ar' ? 'نشط' : 'Active' },
    { value: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
    { value: 'rejected', label: language === 'ar' ? 'مرفوض' : 'Rejected' },
  ];

  const paidOptions = [
    { value: 'paid', label: language === 'ar' ? 'مدفوع' : 'Paid' },
    { value: 'unpaid', label: language === 'ar' ? 'غير مدفوع' : 'Unpaid' },
    { value: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
  ];

  if (!isOpen || !studentData) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl z-50">

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            <span>{t('editStudent')}</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleEditSubmit)} className="p-6 space-y-6 text-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')} *</label>
              <input {...register('name')} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'السن' : 'Age'}</label>
              <input {...register('age')} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start" />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')} *</label>
              <input {...register('phone')} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start" dir="ltr" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')} *</label>
              <input {...register('email')} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start" dir="ltr" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Country Code */}
            <Controller
              name="phone_code"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={t('countryCode')}
                  value={value}
                  options={countryCodeOptions}
                  onChange={onChange}
                />
              )}
            />

            {/* Gender */}
            <Controller
              name="gender"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={t('gender')}
                  value={value}
                  options={genderOptions}
                  onChange={onChange}
                />
              )}
            />

            {/* Birth Date */}
            <div>
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

            {/* Country */}
            <Controller
              name="country"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={t('country')}
                  value={value}
                  options={countryOptions}
                  onChange={onChange}
                />
              )}
            />

            {/* City */}
            <Controller
              name="city"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={language === 'ar' ? 'المدينة' : 'City'}
                  value={value}
                  options={cityOptions}
                  onChange={onChange}
                  placeholder={language === 'ar' ? 'اختر المدينة' : 'Select City'}
                />
              )}
            />

                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={t('nationality')}
                      value={field.value}
                      options={nationalityOptions}
                      placeholder={t('selectNationality')}
                      onChange={field.onChange}
                    />
                  )}
                />

            {/* Plan */}
          <div className="grid md:col-span-1">
              <Controller
              name="plan"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={t('studyPlan')}
                  value={value}
                  options={planOptions}
                  onChange={onChange}
                />
              )}
            />
          </div>

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
          </div>

          {/* Status & Paid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={t('status')}
                  value={value}
                  options={statusOptions}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              name="paid"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  label={language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                  value={value}
                  options={paidOptions}
                  onChange={onChange}
                />
              )}
            />
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">{t('cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-blue-200">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
