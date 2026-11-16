import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlanFormData, getPlanSchema } from '../../lib/schemas/PlanSchema';
import { Resolver, useForm, Controller } from 'react-hook-form';
import CustomSelect from '../ui/CustomSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { getCurrencies } from '../../features/admin/services/CurrencyServices';
import { Currency } from '../../types/currency';


interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PlanFormData & { id?: string }) => Promise<void>;
  initialData?: (PlanFormData & { id: string }) | null;
}

export default function AddPlanModal({ isOpen, onClose, onSave, initialData }: AddPlanModalProps) {
  const { language, t } = useLanguage();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(getPlanSchema(t)) as Resolver<PlanFormData>,
    defaultValues: {
      name: '',
      nameEn: '',
      description: '',
      price: 0,
      currencyId: '',
      duration: 1,
      sessionsCount: 0,
      sessionTime: 60,
      planType: "individual",
      maxStudents: "0",
      color: "#3b82f6",
      features: [''],
      isPopular: false,
      status: 'active',
    },

  });
  const features = watch('features') || [];
  const planType = watch('planType');
  const addFeature = () => {
    setValue('features', [...features, '']);
  };

  const removeFeature = (index: number) => {
    const updated = features.filter((_: string, i: number) => i !== index);
    setValue('features', updated.length > 0 ? updated : ['']);
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setValue('features', updated);
  };


  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await getCurrencies();
        setAvailableCurrencies(data.currencies);
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
      }
    };
    fetchCurrencies();
  }, []);




  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          name: '',
          nameEn: '',
          description: '',
          price: 0,
          currencyId: availableCurrencies.find(c => c.default)?.id || '',
          duration: 1,
          sessionsCount: 0,
          sessionTime: 60,
          planType: "individual",
          maxStudents: "0",
          color: "#3b82f6",
          features: [''],
          isPopular: false,
          status: 'active',
        });

      }
    }
  }, [initialData, reset, isOpen, availableCurrencies]);

  const text = {
    title: { ar: initialData ? 'تعديل خطة' : 'إضافة خطة جديدة', en: initialData ? 'Edit Plan' : 'Add New Plan' },
    nameAr: { ar: 'اسم الخطة (عربي)', en: 'Plan Name (Arabic)' },
    nameEn: { ar: 'اسم الخطة (إنجليزي)', en: 'Plan Name (English)' },
    planType: { ar: 'نوع الخطة', en: 'Plan Type' },
    single: { ar: 'حصة فردية', en: 'Single Session' },
    group: { ar: 'حصة جماعية', en: 'Group Session' },
    studentsNum: { ar: "عدد الطلاب", en: "Number of students" },
    unlimitedHint: { ar: "إدخال 0 يعني عدد غير محدود من الطلاب", en: "Entering 0 means unlimited number of students" },
    color: { ar: "لون الخطة", en: "Plan Color" },
    description: { ar: 'الوصف', en: 'Description' },
    price: { ar: 'السعر', en: 'Price' },
    currency: { ar: 'العملة', en: 'Currency' },
    duration: { ar: 'المدة (شهر)', en: 'Duration (Months)' },
    sessionsCount: { ar: 'عدد الحصص', en: 'Sessions Count' },
    sessionTime: { ar: 'مدة الحصة (دقيقة)', en: 'Session Time (Minutes)' },
    features: { ar: 'المميزات', en: 'Features' },
    addFeature: { ar: 'إضافة ميزة', en: 'Add Feature' },
    isPopular: { ar: 'الأكثر شعبية', en: 'Most Popular' },
    status: { ar: 'الحالة', en: 'Status' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    save: { ar: 'حفظ التغييرات', en: 'Save Changes' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    featurePlaceholder: { ar: 'اكتب الميزة...', en: 'Enter feature...' }
  };

  const onSubmit = async (data: PlanFormData) => {
    const filteredFeatures = data.features?.filter(f => typeof f === 'string' && f.trim() !== '') || [];

    const payload: any = {
      ...data,
      id: initialData?.id
    };

    if (filteredFeatures.length > 0) {
      payload.features = filteredFeatures;
    } else {
      delete payload.features;
    }

    await onSave(payload);
    reset();
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-50">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, (errs) => console.log('Form validation errors:', errs))} className="p-6 space-y-6">

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.nameAr[language]}
              </label>
              <input {...register('name')} className="w-full px-4 py-2.5 border rounded-lg text-start" />
              {errors.name && (<p className="text-red-500 text-sm mt-1 text-start"> {errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.nameEn[language]}
              </label>
              <input {...register('nameEn')} className="w-full px-4 py-2.5 border rounded-lg" />

              {errors.nameEn && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.nameEn.message}
                </p>
              )}
            </div>

          </div>

          {/* Plan type  & MaxStudents*/}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.planType[language]}
            </label>
            <Controller
              name="planType"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={[
                    { label: text.single[language], value: 'individual' },
                    { label: text.group[language], value: 'group' },
                  ]}
                  className='text-start'
                  {...field}
                />
              )}
            />
            {errors.planType && (
              <p className="text-red-500 text-sm mt-1 text-start">
                {errors.planType.message}
              </p>
            )}
          </div>

          {planType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.studentsNum[language]}
              </label>
              <input type='text' {...register('maxStudents')} className="w-full px-4 py-2.5 border rounded-lg text-start" />
              <p className="text-green-600 text-xs mt-1 text-start font-medium">
                {text.unlimitedHint[language]}
              </p>
              {errors.maxStudents && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.maxStudents.message}
                </p>
              )}
            </div>
          )}

          {/*Color*/}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.color[language]}
            </label>
            <div className="flex items-center gap-3">
              <input type="color" {...register('color')} className="w-14 h-10 rounded-lg cursor-pointer border border-gray-300 p-0" />
              <input type="text" {...register('color')} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-start" placeholder="#3b82f6" dir="ltr" />
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.description[language]}
            </label>
            <textarea {...register('description')} rows={3} className="w-full px-4 py-2.5 border rounded-lg text-start resize-none" />
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.price[language]}
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 border rounded-lg text-start"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.currency[language]}
              </label>
              <Controller
                name="currencyId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={availableCurrencies.map((curr) => ({
                      value: curr.id,
                      label: `${curr.code} - ${language === 'ar' ? curr.name_ar : curr.name_en}`
                    }))}
                  />
                )}
              />
              {errors.currencyId && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.currencyId.message}
                </p>
              )}
            </div>


          </div>
          {/* Duration + Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.duration[language]}
              </label>
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 border rounded-lg text-start"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.sessionsCount[language]}
              </label>
              <input
                type="number"
                {...register('sessionsCount', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 border rounded-lg text-start"
              />
              {errors.sessionsCount && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.sessionsCount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.sessionTime[language]}
              </label>
              <Controller
                name="sessionTime"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    options={[
                      { label: t('30minutes'), value: 30 },
                      { label: t('45minutes'), value: 45 },
                      { label: t('60minutes'), value: 60 },
                      { label: t('90minutes'), value: 90 },
                      { label: t('120minutes'), value: 120 },
                    ]}
                    className='text-start'
                    {...field}
                  />
                )}
              />
              {errors.sessionTime && (
                <p className="text-red-500 text-sm mt-1 text-start">
                  {errors.sessionTime.message}
                </p>
              )}
            </div>

          </div>

          {/* Features (Optional) */}
          <div>
            <div className="flex justify-between mb-3">
              <button type="button" onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {text.addFeature[language]}
              </button>
              <label className="text-sm font-medium">{text.features[language]}</label>
            </div>

            <div className="space-y-3">
              {features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    disabled={features.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={text.featurePlaceholder[language]}
                    className="flex-1 px-4 py-2.5 border rounded-lg border-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Boolean + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-end gap-3">
              <label className="text-sm font-medium text-gray-700">
                {text.isPopular[language]}
              </label>
              <input type="checkbox" {...register('isPopular')}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"

              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-gray-700 text-start mb-1">
                {text.status[language]}
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={[
                      { value: 'active', label: text.active[language] },
                      { value: 'inactive', label: text.inactive[language] }
                    ]}
                  />
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 rounded-lg">
              {text.cancel[language]}
            </button>

            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg">
              <Save className="w-5 h-5" />
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
