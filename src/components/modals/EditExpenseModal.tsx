import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: {
    id: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    paymentMethod: string;
    status: 'paid' | 'pending';
  };
  onSave: (expense: any) => void;
}

export default function EditExpenseModal({ isOpen, onClose, expense, onSave }: EditExpenseModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    description: expense.description,
    amount: expense.amount.toString(),
    currency: expense.currency,
    category: expense.category,
    date: expense.date,
    paymentMethod: expense.paymentMethod,
    status: expense.status
  });

  const text = {
    title: { ar: 'تعديل المصروف', en: 'Edit Expense' },
    description: { ar: 'الوصف', en: 'Description' },
    descriptionPlaceholder: { ar: 'أدخل الوصف', en: 'Enter description' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    category: { ar: 'الفئة', en: 'Category' },
    date: { ar: 'التاريخ', en: 'Date' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    paymentMethodPlaceholder: { ar: 'أدخل طريقة الدفع', en: 'Enter payment method' },
    status: { ar: 'الحالة', en: 'Status' },
    paid: { ar: 'مقبول', en: 'Paid' },
    pending: { ar: 'معلق', en: 'Pending' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    salaries: { ar: 'رواتب', en: 'Salaries' },
    utilities: { ar: 'مرافق', en: 'Utilities' },
    supplies: { ar: 'لوازم', en: 'Supplies' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    general: { ar: 'عام', en: 'General' },
    administrative: { ar: 'إدارية', en: 'Administrative' },
    other: { ar: 'أخرى', en: 'Other' }
  };

  const categories = [
    { id: 'salaries', label: text.salaries },
    { id: 'utilities', label: text.utilities },
    { id: 'supplies', label: text.supplies },
    { id: 'marketing', label: text.marketing },
    { id: 'general', label: text.general },
    { id: 'administrative', label: text.administrative },
    { id: 'other', label: text.other }
  ];

  const currencies = [
    { code: 'SAR', symbol: 'ر.س' },
    { code: 'EGP', symbol: 'ج.م' },
    { code: 'USD', symbol: '$' }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: expense.id,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      status: formData.status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.description[language]} *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={text.descriptionPlaceholder[language]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.category[language]} *
              </label>
              <CustomSelect
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value as string })}
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.label[language]
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.currency[language]} *
              </label>
              <CustomSelect
                value={formData.currency}
                onChange={(value) => setFormData({ ...formData, currency: value as string })}
                options={currencies.map(curr => ({
                  value: curr.code,
                  label: curr.symbol
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.amount[language]} *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
              min="0"
              required
            />
          </div>

          <div>
            <DatePickerField
              label={`${text.date[language]} *`}
              value={formData.date}
              onChange={(val) => setFormData({ ...formData, date: val })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.paymentMethod[language]}
            </label>
            <input
              type="text"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder={text.paymentMethodPlaceholder[language]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.status[language]} *
            </label>
            <CustomSelect
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'paid' | 'pending' })}
              options={[
                { value: 'pending', label: text.pending[language] },
                { value: 'paid', label: text.paid[language] }
              ]}
            />
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
