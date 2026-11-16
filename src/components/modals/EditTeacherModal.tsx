import { X, Users, Eye, EyeOff, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTeacherById } from '../../features/admin/hooks/useTeacher';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import { TeacherFormData, getTeacherSchema } from '../../lib/schemas/TeacherSchema';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Teacher } from '../../types/teachers';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { useSubjects } from '../../features/admin/hooks/useSubjects';
import { CustomCheckbox } from '../ui/CustomCheckbox';
import { DEFAULT_COUNTRIES } from '../../consts/countries';
import { useGetCities } from '../../features/teacher/hooks/useCity';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacherData: TeacherFormData) => Promise<void>;
  teacher: Teacher | null;
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'Egypt': 'EGP',
  'Saudi Arabia': 'SAR',
  'United Arab Emirates': 'AED',
  'Kuwait': 'KWD',
  'Qatar': 'QAR',
  'Bahrain': 'BHD',
  'Oman': 'OMR',
  'Jordan': 'JOD',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Turkey': 'TRY',
  'Sudan': 'SDG',
  'Morocco': 'MAD',
  'Algeria': 'DZD',
  'Tunisia': 'TND',
  'Iraq': 'IQD',
  'Lebanon': 'LBP',
};

const getMatchingCurrencyId = (countryName: string, currencies: any[]) => {
  if (!countryName || !currencies || currencies.length === 0) return '';
  const expectedCode = COUNTRY_CURRENCY_MAP[countryName];
  if (expectedCode) {
    const matched = currencies.find(
      (c: any) => c.code?.toUpperCase() === expectedCode.toUpperCase()
    );
    if (matched) return matched.id;
  }
  const matchedByName = currencies.find(
    (c: any) =>
      c.name_en?.toLowerCase().includes(countryName.toLowerCase()) ||
      c.code?.toUpperCase().includes(countryName.substring(0, 3).toUpperCase())
  );
  if (matchedByName) return matchedByName.id;
  return '';
};

export default function EditTeacherModal({ isOpen, onClose, onSubmit, teacher }: EditTeacherModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [countryCodes] = useState<Array<{ name: string; phone_code: string; emoji?: string; iso2: string }>>(DEFAULT_COUNTRIES);
  const { data: currenciesData } = useCurrency();
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects();

  const { data: fullTeacher, isLoading: isLoadingFullTeacher } = useTeacherById(isOpen && teacher ? teacher.id : undefined);
  const teacherData = fullTeacher || teacher;

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
    if (teacherData) {
      console.log("==> EditTeacherModal Mount:", teacherData);

      // Extract subject IDs directly from the API response
      const subjectsArray = teacherData.teacherSubjects || [];
      const subjectIds = subjectsArray.map((s: any) => String(s.subjectId || s.subject?.id)).filter(Boolean);
      let currencyId = teacherData.currencyId || teacherData.currency?.id || '';
      const teacherCountry = teacherData.user.country || teacherData.user?.country || 'Egypt';


      if (!currencyId && currenciesData?.currencies) {
        currencyId =
          getMatchingCurrencyId(teacherCountry, currenciesData.currencies) ||
          currenciesData.default?.id ||
          currenciesData.currencies[0]?.id ||
          '';
      }

      console.log("==> Extracted Data:", { subjectIds, currencyId, teacherCountry });

      reset({
        name: teacherData.user?.name || '',
        email: teacherData.user?.email || '',
        phone: teacherData.user?.phone || '',
        phone_code: teacherData.user?.code_country || '+20',
        password: teacherData.user?.password || '',
        currency: currencyId,
        nationality: (teacherData.user as any)?.nationality || teacherData.nationality || '',
        gender: (teacherData.gender?.toLowerCase() as 'male' | 'female') || 'male',
        status: teacherData.active ? 'active' : 'inactive',
        subjects: subjectIds,
        meeting_link: teacherData.meeting_link || '',
        country: teacherCountry,
        city: teacherData.user.city || '',
        age: teacherData.user.age ? String(teacherData.user.age) : '',
      });
    }
  }, [teacherData, reset, currenciesData]);

  const selectedCountry = watch("country");

  useEffect(() => {
    if (selectedCountry && currenciesData?.currencies?.length) {
      const matchedCurrencyId = getMatchingCurrencyId(selectedCountry, currenciesData.currencies);
      if (matchedCurrencyId) {
        setValue('currency', matchedCurrencyId, { shouldValidate: true });
      }
    }
  }, [selectedCountry, currenciesData, setValue]);

  const handleOnSubmit = async (data: TeacherFormData) => {
    await onSubmit(data);
    onClose();
  };

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

  const uniqueCountryCodes = Array.from(
    new Map(countryCodes.map((c) => [`+${c.phone_code}`, c])).values()
  );
  const displayNames = new Intl.DisplayNames([language === 'ar' ? 'ar' : 'en'], { type: 'region' });
  const countryCodeOptions = uniqueCountryCodes.map((c) => ({
    value: `+${c.phone_code}`,
    searchText: `${displayNames.of(c.iso2) || c.name} +${c.phone_code}`,
    label: (
      <div className="flex justify-between items-center w-full">
        <span className="font-mono">+{c.phone_code}</span>
        <span className="text-gray-500 text-xs">{displayNames.of(c.iso2) || c.name}</span>
      </div>
    ),
  }));

  const nationalityOptions = useMemo(() => {
    return DEFAULT_COUNTRIES.map((country) => ({
      value: country.nationality,
      label: country.nationality,
    }));
  }, []);

  const selectedCountryObj = DEFAULT_COUNTRIES.find((c) => c.name === selectedCountry);
  const iso2 = selectedCountryObj?.iso2?.toLowerCase() || "eg";
  const { data: citiesData } = useGetCities(iso2);
  const cityOptions = citiesData ? citiesData.map((city: any) => ({
    value: city.name,
    label: city.name
  })) : [];

  const countries = DEFAULT_COUNTRIES.map((c) => ({
    value: c.name,
    label: `${c.emoji} ${displayNames.of(c.iso2) || c.name}`,
  }));

  if (isLoadingFullTeacher) {
    return (
      <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isOpen || !teacher) return null;

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
              {/* Age */}
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'السن' : 'Age'}
                </label>
                <input
                  type="text"
                  placeholder="ex: 30"
                  {...register('age')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
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

            {/* Row 2: Password */}
            <div className="grid grid-cols-1 gap-4">
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

            {/* Row 3: Country Code and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')} </label>
                <input
                  type="tel"
                  placeholder="123456789"
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Row 4: Currency and Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Row 4.5: Country and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('country')}
                    value={field.value}
                    options={countries}
                    onChange={field.onChange}
                  />
                )}
              />

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

            {/* Row 5: Zoom Link and Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('zoomLink')}
                </label>
                <input
                  type="text"
                  disabled={teacherData?.meeting_link !== null ? true : false}
                  placeholder="https://zoom.us/j/123456789"
                  {...register('meeting_link')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                />
                {errors.meeting_link && <p className="text-red-500 text-xs mt-1">{errors.meeting_link.message}</p>}
              </div>

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
