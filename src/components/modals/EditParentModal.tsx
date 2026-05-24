import { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Lock, Users, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ParentFormData, getParentSchema } from '../../lib/schemas/ParentSchema';
import { Resolver, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomSelect from '../ui/CustomSelect';
import { Parent } from '../../types/parentsAdmin';
import { useStudents } from '../../features/admin/hooks/useStudents';

interface EditParentModalProps {
  parent: Parent;
  onClose: () => void;
  onSubmit: (parentData: ParentFormData) => void;
}

export default function EditParentModal({
  parent,
  onClose,
  onSubmit,
}: EditParentModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const { data: studentsData } = useStudents();

  const studentOptions =
    (studentsData?.data?.studentsData || []).map((s: any) => ({
      value: s.id,
      label: s.user.name,
    })) || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ParentFormData>({
    resolver: zodResolver(getParentSchema(t)) as Resolver<ParentFormData>,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      codeCountry: '+20',
      country: 'Egypt',
      students: [],
    },
  });

  useEffect(() => {
    if (parent) {
      reset({
        name: parent.name || '',
        email: parent.email || '',
        phone: parent.phone || '',
        password: '',
        codeCountry: parent.code_country || '+20',
        country: 'Egypt',
        students: parent.students?.map((s) => s.id) || [],
      });
    }
  }, [parent, reset]);

  const handleOnSubmit = (data: ParentFormData) => {
    onSubmit({
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    onClose();
  };

  const text = {
    title: { ar: 'تعديل ولي أمر', en: 'Edit Parent' },
    name: { ar: 'الاسم الكامل', en: 'Full Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
    phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    linkedStudents: { ar: 'الطلاب المرتبطين', en: 'Linked Students' },
    selectStudents: { ar: 'اختر الطلاب', en: 'Select Students' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    save: { ar: 'حفظ التعديلات', en: 'Save Changes' },
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">
            {text.title[language]}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleOnSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">
                {text.name[language]}
              </label>

              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="text"
                  {...register('name')}
                  className="w-full pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-start"
                />
              </div>

              {errors.name && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">
                {text.email[language]}
              </label>

              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="email"
                  {...register('email')}
                  className="w-full pr-12 py-3 border border-gray-200 rounded-xl text-start"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">
                {text.phone[language]}
              </label>

              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full pr-12 py-3 border border-gray-200 rounded-xl text-start"
                />
              </div>

              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Hidden Fields */}
            <input
              type="hidden"
              {...register('codeCountry')}
              value="+20"
            />

            <input
              type="hidden"
              {...register('country')}
              value="Egypt"
            />

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">
                {text.password[language]}
              </label>

              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-12 py-3 border rounded-xl text-start focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:ring-purple-100 focus:border-purple-500'
                  }`}
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Students */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">
                {text.linkedStudents[language]}
              </label>

              <div className="relative">
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />

                <Controller
                  name="students"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      mode="multiple"
                      options={studentOptions}
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={(val) =>
                        field.onChange(Array.isArray(val) ? val : [val])
                      }
                      placeholder={text.selectStudents[language]}
                    />
                  )}
                />
              </div>

              {errors.students && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.students.message}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>

            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg"
            >
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}