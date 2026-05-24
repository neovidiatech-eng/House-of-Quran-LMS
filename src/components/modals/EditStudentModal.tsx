import { X, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData & { id: string }) => void;
  studentData: StudentFormData & { id: string } | null;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  onSubmit,
  studentData,
}: EditStudentModalProps) {
  const { language, t } = useLanguage();
  const { data: plansData } = usePlans();

  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(getStudentSchema(t)),
    defaultValues: studentData || undefined,
  });

  useEffect(() => {
    if (isOpen && studentData) {
      reset(studentData);
    }
  }, [isOpen, studentData, reset]);

  if (!isOpen || !studentData) return null;


  const handleEditSubmit = (data: StudentFormData) => {
    const cleanedData = { ...data };
    if (!cleanedData.password) {
      delete cleanedData.password;
    }

    onSubmit({ ...cleanedData, id: studentData!.id });
    onClose();
  };
  const countryCodes = [
    { code: '+20', country: 'مصر', countryEn: 'Egypt' },
    { code: '+966', country: 'السعودية', countryEn: 'Saudi Arabia' },
    { code: '+971', country: 'الإمارات', countryEn: 'UAE' },
    { code: '+965', country: 'الكويت', countryEn: 'Kuwait' },
  ];

  const countryCodeOptions = countryCodes.map((c) => ({
    value: c.code,
    label: (
      <div className="flex justify-between items-center w-full" dir="ltr">
        <span className="font-mono">{c.code}</span>
        <span className="text-gray-500 text-xs">{language === 'ar' ? c.country : c.countryEn}</span>
      </div>
    ),
  }));

  const genderOptions = [
    { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
    { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' },
  ];

  const countryOptions = [
    { value: 'egypt', label: language === 'ar' ? 'مصر' : 'Egypt' },
    { value: 'saudi', label: language === 'ar' ? 'السعودية' : 'Saudi Arabia' },
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

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">

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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')} *</label>
              <input {...register('email')} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start" dir="ltr" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')} *</label>
              <input {...register('phone')} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-start" dir="ltr" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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

            {/* Plan */}
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

          {/* Status */}
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
