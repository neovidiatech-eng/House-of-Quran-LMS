import { useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ExpenseFormData, getExpenseSchema } from '../../lib/schemas/ExpenseSchema';
import { Resolver, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { Expense } from '../../types/expenses';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
  initialData?: Expense | null;
}

export default function AddExpenseModal({ isOpen, onClose, onSave, initialData }: AddExpenseModalProps) {
  const { language, t } = useLanguage();
  const { data: currenciesData } = useCurrency();
  const currencies = currenciesData?.currencies || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(getExpenseSchema(t)) as Resolver<ExpenseFormData>,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      currencyId: '',
      type: 'general',
      payment_type: ''
    }
  });

  const text = {
    title: { ar: initialData ? 'تعديل المصروف' : 'إضافة مصروف جديد', en: initialData ? 'Edit Expense' : 'Add New Expense' },
    expenseTitle: { ar: 'عنوان المصروف', en: 'Expense Title' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    type: { ar: 'النوع', en: 'Type' },
    date: { ar: 'التاريخ', en: 'Date' },
    paymentType: { ar: 'طريقة الدفع', en: 'Payment Method' },
    status: { ar: 'الحالة', en: 'Status' },
    paid: { ar: 'مقبول', en: 'Paid' },
    pending: { ar: 'معلق', en: 'Pending' },
    failed: { ar: 'فاشل', en: 'Failed' },
    save: { ar: initialData ? 'حفظ التعديلات' : 'إضافة المصروف', en: initialData ? 'Save Changes' : 'Add Expense' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    monthly: { ar: 'شهري', en: 'Monthly' },
    salary: { ar: 'رواتب', en: 'Salary' },
    amenities: { ar: 'مرافق', en: 'Amenities' },
    general: { ar: 'عام', en: 'General' },
    management: { ar: 'إدارة', en: 'Management' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    other: { ar: 'أخرى', en: 'Other' },
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          amount: initialData.amount,
          currencyId: initialData.currencyId,
          type: initialData.type,
          date: new Date(initialData.date).toISOString().split('T')[0],
          payment_type: initialData.payment_type,
          status: initialData.status
        });
      } else {
        reset({
          title: '',
          amount: 0,
          currencyId: currencies[0]?.id || '',
          type: 'general',
          date: new Date().toISOString().split('T')[0],
          payment_type: '',
          status: 'pending'
        });
      }
    }
  }, [isOpen, initialData, reset, currencies]);

  if (!isOpen) return null;

  const onSubmit = (data: ExpenseFormData) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        <div className="bg-gray-50 border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {text.expenseTitle[language]} *
            </label>
            <input
              {...register("title")}
              placeholder={language === 'ar' ? 'أدخل عنوان المصروف' : 'Enter expense title'}
              className={`w-full h-14 px-5 rounded-2xl border bg-gray-50 outline-none transition-all focus:ring-2 ${
                errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.amount[language]} *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className={`w-full h-14 px-5 rounded-2xl border bg-gray-50 outline-none transition-all focus:ring-2 ${
                  errors.amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                }`}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.currency[language]} *
              </label>
              <Controller
                name="currencyId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={currencies.map(curr => ({
                      value: curr.id,
                      label: `${curr.name_en} (${curr.symbol})`
                    }))}
                  />
                )}
              />
              {errors.currencyId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.currencyId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.type[language]} *
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={[
                      { value: 'salary', label: text.salary[language] },
                      { value: 'amenities', label: text.amenities[language] },
                      { value: 'general', label: text.general[language] },
                      { value: 'management', label: text.management[language] },
                      { value: 'marketing', label: text.marketing[language] },
                      { value: 'other', label: text.other[language] }
                    ]}
                  />
                )}
              />
            </div>

            {/* Date */}
            <div>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label={`${text.date[language]} *`}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.date?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.paymentType[language]} *
              </label>
              <input
                {...register("payment_type")}
                placeholder={language === 'ar' ? 'أدخل طريقة الدفع' : 'Enter payment method'}
                className={`w-full h-14 px-5 rounded-2xl border bg-gray-50 outline-none transition-all focus:ring-2 ${
                  errors.payment_type ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                }`}
              />
              {errors.payment_type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.payment_type.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.status[language]} *
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={[
                      { value: 'pending', label: text.pending[language] },
                      { value: 'paid', label: text.paid[language] },
                      { value: 'failed', label: text.failed[language] }
                    ]}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
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
