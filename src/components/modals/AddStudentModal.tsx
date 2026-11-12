import { useState, useMemo } from 'react';
import { X, GraduationCap, Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { Plan } from '../../types/plan';
import { DEFAULT_COUNTRIES } from '../../consts/countries';
import { useGetCities } from '../../features/teacher/hooks/useCity';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData) => Promise<void>;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [countryCodes] = useState<Array<{ name: string; phone_code: string; emoji?: string; iso2: string }>>(DEFAULT_COUNTRIES);
  const { data: plansData } = usePlans();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(getStudentSchema(t)) as Resolver<StudentFormData>,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      phone_code: '+20',
      password: '',
      gender: 'male',
      plan: '',
      country: 'Egypt',
      nationality: '',
      age: '',
      city: '',
      status: 'approved',
      birthDate: '',
      paid: 'unpaid'
    }
  });

  const selectedCountry = watch("country");
  const selectedCountryObj = DEFAULT_COUNTRIES.find(
    (c) => c.name.toLowerCase() === selectedCountry?.toLowerCase() || c.iso2.toLowerCase() === selectedCountry?.toLowerCase()
  );
  const iso2 = selectedCountryObj?.iso2?.toLowerCase() || "eg";
  const { data: citiesData } = useGetCities(iso2);

  const cityOptions = useMemo(() => {
    return citiesData ? citiesData.map((city: any) => ({
      value: city.name,
      label: city.name
    })) : [];
  }, [citiesData]);

  const displayNames = useMemo(() => {
    return new Intl.DisplayNames([language === 'ar' ? 'ar' : 'en'], { type: 'region' });
  }, [language]);

  const countryOptions = useMemo(() => {
    return DEFAULT_COUNTRIES.map((c) => ({
      value: c.name,
      label: `${c.emoji} ${displayNames.of(c.iso2) || c.name}`,
    }));
  }, [displayNames]);

  const nationalityOptions = useMemo(() => {
    return DEFAULT_COUNTRIES.map((country) => ({
      value: country.nationality,
      label: country.nationality,
    }));
  }, []);

  

  const uniqueCountryCodes = useMemo(() => {
    return Array.from(
      new Map(countryCodes.map((c) => [`+${c.phone_code}`, c])).values()
    );
  }, [countryCodes]);

  const countryCodeOptions = useMemo(() => {
    return uniqueCountryCodes.map((c) => ({
      value: `+${c.phone_code}`,
      searchText: `${displayNames.of(c.iso2) || c.name} +${c.phone_code}`,
      label: (
        <div className="flex justify-between items-center w-full">
          <span className="font-mono">+{c.phone_code}</span>
          <span className="text-gray-500 text-xs">{displayNames.of(c.iso2) || c.name}</span>
        </div>
      ),
    }));
  }, [uniqueCountryCodes, displayNames]);

  const plans = plansData || [];
  const planOptions = useMemo(() => {
    return [
      { value: '', label: t('noPlan') },
      ...plans.map((p: Plan) => ({
        value: p.id,
        label: language === 'ar' ? p.name_ar : p.name_en,
      }))
    ];
  }, [plans, language, t]);

  const genderOptions = [
    { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
    { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' },
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

  const handleNationalityChange = (val: string) => {
    setValue('nationality', val, { shouldValidate: true });
    const matched = DEFAULT_COUNTRIES.find(
      (c) => c.nationality.toLowerCase() === val.toLowerCase() || c.name.toLowerCase() === val.toLowerCase()
    );
    if (matched) {
      setValue('country', matched.name, { shouldValidate: true });
      setValue('phone_code', `+${matched.phone_code}`, { shouldValidate: true });
      setValue('city', '', { shouldValidate: true });
    }
  };

  const handleCountryChange = (val: string) => {
    setValue('country', val, { shouldValidate: true });
    setValue('city', '', { shouldValidate: true });
    const matched = DEFAULT_COUNTRIES.find((c) => c.name.toLowerCase() === val.toLowerCase() || c.iso2.toLowerCase() === val.toLowerCase());
    if (matched) {
      setValue('phone_code', `+${matched.phone_code}`, { shouldValidate: true });
    }
  };

  const onFormSubmit = async (data: StudentFormData) => {
    await onSubmit({
      ...data,
    });
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            <span>{t('addNewStudent')}</span>
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="p-6 space-y-6 flex-1" dir={language === "ar" ? "rtl" : "ltr"}>

            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  placeholder={t('name')}
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Row 2: Phone (with Country Code) & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone & Country Code */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone')} *
                </label>
                <div className="flex gap-2 items-start" dir="ltr">
                  <div className="w-32 shrink-0">
                    <Controller
                      name="phone_code"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          options={countryCodeOptions}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      placeholder="123456789"
                      {...register('phone')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                      dir="ltr"
                    />
                  </div>
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="text-start relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full px-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start bg-gray-50 transition-all"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            {/* Row 3: Nationality & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('nationality')}
                    value={field.value}
                    options={nationalityOptions}
                    placeholder={t('selectNationality')}
                    onChange={(val) => {
                      field.onChange(val);
                      handleNationalityChange(val as string);
                    }}
                  />
                )}
              />

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('country')}
                    value={field.value}
                    options={countryOptions}
                    onChange={(val) => {
                      field.onChange(val);
                      handleCountryChange(val as string);
                    }}
                  />
                )}
              />
            </div>

            {/* Row 4: City & Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={language === 'ar' ? 'المدينة' : 'City'}
                    value={field.value}
                    options={cityOptions}
                    onChange={field.onChange}
                    placeholder={language === 'ar' ? 'اختر المدينة' : 'Select City'}
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

            {/* Row 5: Gender & Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'السن' : 'Age'}
                </label>
                <input
                  type="text"
                  placeholder="ex: 20"
                  {...register('age')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
              </div>
            </div>

            {/* Row 6: Birth Date & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Row 7: Paid Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="paid"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                    value={field.value}
                    options={paidOptions}
                    onChange={field.onChange}
                  />
                )}
              />
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
              className="flex-1 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
            >
              {t('addNewStudent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
