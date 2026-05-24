import { useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Transaction } from '../../pages/Transactions';
import { TransactionFormData, getTransactionSchema } from '../../lib/schemas/TransactionSchema';
import { Resolver, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: TransactionFormData | Transaction) => void;
  currencies: { code: string; symbol: string; rate: number }[];
  editingTransaction?: Transaction | null;
}

export default function AddTransactionModal({ isOpen, onClose, onSave, currencies, editingTransaction }: AddTransactionModalProps) {
  const { language, t } = useLanguage();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(getTransactionSchema(t)) as Resolver<TransactionFormData>,
    defaultValues: {
      type: 'income',
      currency: 'SAR',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      sessionDuration: 60
    }
  });
  const watchType = watch('type');
  const watchSessionCount = watch('sessionCount');
  const watchSessionDuration = watch('sessionDuration');
  const watchRatePerHour = watch('ratePerHour');

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        reset({
          ...editingTransaction,
          sessionDuration: Number(editingTransaction.sessionDuration) || 60
        });
      } else {
        reset({
          type: 'income',
          currency: 'SAR',
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          studentName: '',
          teacherName: '',
          amount: 0,
          paymentMethod: '',
          notes: ''
        });
      }
    }
  }, [editingTransaction, isOpen, reset]);

  const text = {
    title: { ar: 'إضافة معاملة جديدة', en: 'Add New Transaction' },
    type: { ar: 'النوع', en: 'Type' },
    income: { ar: 'إيراد (اشتراك طالب)', en: 'Income (Student Subscription)' },
    teacher_expense: { ar: 'مصروف معلم', en: 'Teacher Expense' },
    student: { ar: 'اسم الطالب', en: 'Student Name' },
    teacher: { ar: 'اسم المعلم', en: 'Teacher Name' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    date: { ar: 'التاريخ', en: 'Date' },
    status: { ar: 'الحالة', en: 'Status' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    pending: { ar: 'معلق', en: 'Pending' },
    notes: { ar: 'ملاحظات', en: 'Notes' },
    sessionCount: { ar: 'عدد الحصص', en: 'Session Count' },
    sessionDuration: { ar: 'مدة الحصة (دقيقة)', en: 'Session Duration (min)' },
    ratePerHour: { ar: 'سعر الساعة للمعلم', en: 'Teacher Rate/Hour' },
    save: { ar: 'إضافة', en: 'Add' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    calcNote: { ar: 'المبلغ = عدد الحصص × (مدة الحصة / 60) × سعر الساعة', en: 'Amount = sessions × (duration/60) × rate/hour' }
  };

  if (!isOpen) return null;

  const handleAutoCalculate = () => {
    const sessions = Number(watchSessionCount) || 0;
    const duration = Number(watchSessionDuration) || 0;
    const rate = Number(watchRatePerHour) || 0;
    const total = sessions * (duration / 60) * rate;
    setValue('amount', Number(total.toFixed(2)));
  };
  console.log(errors)
  const onSubmit = (data: TransactionFormData) => {
    if (editingTransaction) {
      onSave({ ...data, id: editingTransaction.id } as Transaction);
      console.log(data)
    } else {
      onSave(data);
      console.log(data)

    }
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{text.title[language]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.type[language]}</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  options={[
                    { value: 'income', label: 'إيراد (اشتراك طالب)' },
                    { value: 'teacher_expense', label: 'مصروف معلم' }
                  ]}
                />
              )}
            />
          </div>

          {watchType === 'income' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">اسم الطالب *</label>
              <input
                type="text"
                {...register('studentName')}
                className={`w-full px-4 py-2.5 border rounded-lg text-start ${errors.studentName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.studentName && <p className="text-red-500 text-xs mt-1 text-start">{errors.studentName.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.teacher[language]} *</label>
            <input
              type="text"
              {...register('teacherName')}
              className={`w-full px-4 py-2.5 border rounded-lg text-start ${errors.teacherName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.teacherName && <p className="text-red-500 text-xs mt-1 text-start">{errors.teacherName.message}</p>}
          </div>

          {watchType === 'teacher_expense' && (
            <div className="bg-primary-50 border border-blue-200 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="الحصص" {...register('sessionCount')} className="px-3 py-2 border rounded-lg text-start text-sm" />
                <Controller
                  name="sessionDuration"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      {...field}
                      options={[
                        { value: 30, label: '30' },
                        { value: 45, label: '45' },
                        { value: 60, label: '60' }
                      ]}
                    />
                  )}
                />
                <input type="number" step="0.01" placeholder="السعر" {...register('ratePerHour')} className="px-3 py-2 border rounded-lg text-start text-sm" />
              </div>
              <button type="button" onClick={handleAutoCalculate} className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium">
                {language === 'ar' ? 'احسب المبلغ تلقائياً' : 'Auto Calculate'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.amount[language]} *</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 border rounded-lg text-start ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1 text-start">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.currency[language]}</label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={currencies.map(c => ({
                      value: c.code,
                      label: `${c.symbol} ${c.code}`
                    }))}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.paymentMethod[language]}</label>
              <input type="text" {...register('paymentMethod')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-start" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.status[language]}</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  options={[
                    { value: 'pending', label: 'معلق' },
                    { value: 'completed', label: 'مكتمل' }
                  ]}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.notes[language]}</label>
            <textarea
              {...register('notes')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-start resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 btn-primary text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
