import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CurrencyFormData, getCurrencySchema } from '../../lib/schemas/CurrencySchema';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Currency } from '../../types/currency';
import { CustomCheckbox } from '../ui/CustomCheckbox';

interface AddCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currency: CurrencyFormData & { id?: string }) => void;
  initialData?: Currency | null;
}

export default function AddCurrencyModal({ isOpen, onClose, onSave, initialData }: AddCurrencyModalProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');
  const [isDefault, setIsDefault] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(getCurrencySchema(t)) as Resolver<CurrencyFormData>,
    defaultValues: initialData || {
      name_en: '',
      symbol: '',
      code: '',
      exchangeRate: 1
    }
  });
  /* 
    const isDefault = watch('default');
   */
  const text = {
    title: { ar: 'إضافة عملة جديدة', en: 'Add New Currency' },
    editTitle: { ar: 'تعديل العملة', en: 'Edit Currency' },
    code: { ar: 'رمز العملة (الرمز)', en: 'Currency Code' },
    codePlaceholder: { ar: 'USD, SAR, EGP', en: 'USD, SAR, EGP' },
    nameAr: { ar: 'اسم العملة (بالعربية)', en: 'Currency Name (Arabic)' },
    nameEn: { ar: 'اسم العملة (بالإنجليزية)', en: 'Currency Name (English)' },
    namePlaceholder: { ar: 'مثال: دولار أمريكي', en: 'Example: US Dollar' },
    nameArPlaceholder: { ar: 'الدولار الأمريكي', en: 'US Dollar' },
    symbol: { ar: 'الرمز المختصر', en: 'Symbol' },
    symbolPlaceholder: { ar: '$ أو ر.س', en: '$ or ر.س' },
    exchangeRate: { ar: 'سعر الصرف', en: 'Exchange Rate' },
    exchangeRateHint: { ar: 'مقابل العملة الافتراضية', en: 'Against default currency' },
    isDefault: { ar: 'جعل هذه العملة الافتراضية', en: 'Make this the default currency' },
    arabic: { ar: 'العربية', en: 'Arabic' },
    english: { ar: 'English', en: 'English' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          code: initialData.code,
          name_ar: initialData.name_ar,
          name_en: initialData.name_en,
          symbol: initialData.symbol,
          exchangeRate: initialData.exchangeRate,
          default: initialData.default,
        });
      } else {
        reset({ code: '', name_ar: '', name_en: '', symbol: '', exchangeRate: 1, default: false });
      }
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: CurrencyFormData) => {
    onSave({ ...data, id: initialData?.id });
    onClose();
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? text.editTitle[language] : text.title[language]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.code[language]} *
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder={text.codePlaceholder[language]}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
              maxLength={3}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'ar'
                  ? 'bg-primary-50 text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {text.arabic[language]}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'en'
                  ? 'bg-primary-50 text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {text.english[language]}
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'ar' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                    {text.nameAr[language]} *
                  </label>
                  <input
                    type="text"
                    {...register('name_ar')}
                    placeholder={text.nameArPlaceholder[language]}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name_ar ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar.message}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {text.nameEn[language]} *
                  </label>
                  <input
                    type="text"
                    {...register('name_en')}
                    placeholder={text.namePlaceholder[language]}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name_en && <p className="text-red-500 text-xs mt-1">{errors.name_en.message}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.symbol[language]} *
            </label>
            <input
              type="text"
              {...register('symbol')}
              placeholder={text.symbolPlaceholder[language]}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.symbol ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.exchangeRate[language]} *
            </label>
            <input
              type="number"
              step="0.0001"
              {...register('exchangeRate')}
              disabled={isDefault}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">{text.exchangeRateHint[language]}</p>
          </div>

          <div className="bg-primary-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center justify-end gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">{text.isDefault[language]}</span>
              {/*    <input
                type="checkbox"
                {...register('default')}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setValue('default', checked);
                  if (checked) setValue('exchangeRate', 1);
                }}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              /> */}
              <Controller
                name="default"
                control={control}
                render={({ field }) => (
                  <CustomCheckbox
                    checked={field.value}
                    onChange={field.onChange}
                    label={text.isDefault[language]}
                  />
                )}
              />
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{text.save[language]}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
