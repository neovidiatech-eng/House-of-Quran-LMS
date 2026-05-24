import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Transaction } from '../../pages/Transactions';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onSave: (transaction: Transaction) => void;
  currencies: { code: string; symbol: string; rate: number }[];
}

export default function EditTransactionModal({ isOpen, onClose, transaction, onSave, currencies }: EditTransactionModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    type: transaction.type,
    studentName: transaction.studentName || '',
    teacherName: transaction.teacherName,
    amount: transaction.amount.toString(),
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    date: transaction.date,
    status: transaction.status,
    notes: transaction.notes || '',
    sessionCount: transaction.sessionCount?.toString() || '',
    sessionDuration: transaction.sessionDuration || 60,
    ratePerHour: transaction.ratePerHour?.toString() || ''
  });

  const text = {
    title: { ar: 'تعديل المعاملة', en: 'Edit Transaction' },
    type: { ar: 'النوع', en: 'Type' },
    income: { ar: 'إيراد', en: 'Income' },
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
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    sessionCount: { ar: 'عدد الحصص', en: 'Sessions' },
    sessionDuration: { ar: 'مدة الحصة', en: 'Duration (min)' },
    ratePerHour: { ar: 'سعر/ساعة', en: 'Rate/Hour' }
  };

  if (!isOpen) return null;

  const handleCalculate = () => {
    const sessions = parseFloat(formData.sessionCount) || 0;
    const duration = formData.sessionDuration;
    const rate = parseFloat(formData.ratePerHour) || 0;
    const calculated = sessions * (duration / 60) * rate;
    setFormData(prev => ({ ...prev, amount: calculated.toFixed(2) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...transaction,
      type: formData.type,
      studentName: formData.studentName,
      teacherName: formData.teacherName,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      paymentMethod: formData.paymentMethod,
      date: formData.date,
      status: formData.status,
      notes: formData.notes,
      sessionCount: parseInt(formData.sessionCount) || undefined,
      sessionDuration: formData.sessionDuration,
      ratePerHour: parseFloat(formData.ratePerHour) || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{text.title[language]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.type[language]}</label>
            <CustomSelect
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as 'income' | 'teacher_expense' })}
              options={[
                { value: 'income', label: text.income[language] },
                { value: 'teacher_expense', label: text.teacher_expense[language] }
              ]}
            />
          </div>

          {formData.type === 'income' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.student[language]}</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.teacher[language]} *</label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
              required
            />
          </div>

          {formData.type === 'teacher_expense' && (
            <div className="bg-primary-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-start">{text.sessionCount[language]}</label>
                  <input
                    type="number"
                    value={formData.sessionCount}
                    onChange={(e) => setFormData({ ...formData, sessionCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-start text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-start">{text.sessionDuration[language]}</label>
                  <CustomSelect
                    value={formData.sessionDuration}
                    onChange={(value) => setFormData({ ...formData, sessionDuration: parseInt(value as string) })}
                    options={[
                      { value: 30, label: '30' },
                      { value: 45, label: '45' },
                      { value: 60, label: '60' },
                      { value: 90, label: '90' },
                      { value: 120, label: '120' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-start">{text.ratePerHour[language]}</label>
                  <input
                    type="number"
                    value={formData.ratePerHour}
                    onChange={(e) => setFormData({ ...formData, ratePerHour: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-start text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleCalculate}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                {language === 'ar' ? 'احسب المبلغ' : 'Calculate Amount'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.amount[language]} *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.currency[language]}</label>
              <CustomSelect
                value={formData.currency}
                onChange={(value) => setFormData({ ...formData, currency: value as string })}
                options={currencies.map(c => ({
                  value: c.code,
                  label: `${c.symbol} ${c.code}`
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePickerField
                label={`${text.date[language]} *`}
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.paymentMethod[language]}</label>
              <input
                type="text"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.status[language]}</label>
            <CustomSelect
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'completed' | 'pending' })}
              options={[
                { value: 'pending', label: text.pending[language] },
                { value: 'completed', label: text.completed[language] }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.notes[language]}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              {text.cancel[language]}
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
