import { X, DollarSign, Calendar, Tag, CreditCard, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useExpenseById } from '../../features/admin/hooks/useExpenses';
import { useMemo } from 'react';
import { Expense } from '../../types/expenses';

interface ViewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
}

export default function ViewExpenseModal({ isOpen, onClose, expense: initialExpense }: ViewExpenseModalProps) {
  const { language } = useLanguage();
  const { data: fetchedData } = useExpenseById(initialExpense?.id);

  const expense = useMemo(() => {
    if (!fetchedData) return initialExpense;

    // Robust parsing of different API response formats
    let rawExpense = null;
    if ('id' in fetchedData && ('title' in fetchedData || 'amount' in fetchedData)) {
      rawExpense = fetchedData;
    } else {
      const resData = (fetchedData as any).data;
      if (resData) {
        if ('id' in resData && ('title' in resData || 'amount' in resData)) {
          rawExpense = resData;
        } else if (resData.expense && 'id' in resData.expense && ('title' in resData.expense || 'amount' in resData.expense)) {
          rawExpense = resData.expense;
        }
      }
    }

    if (rawExpense) {
      return rawExpense as Expense;
    }

    return initialExpense;
  }, [fetchedData, initialExpense]);

  const text = {
    title: { ar: 'تفاصيل المصروف', en: 'Expense Details' },
    description: { ar: 'الوصف', en: 'Description' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    category: { ar: 'الفئة', en: 'Category' },
    date: { ar: 'التاريخ', en: 'Date' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    status: { ar: 'الحالة', en: 'Status' },
    paid: { ar: 'مقبول', en: 'Paid' },
    pending: { ar: 'معلق', en: 'Pending' },
    failed: { ar: 'فاشل', en: 'Failed' },
    close: { ar: 'إغلاق', en: 'Close' },
    basicInfo: { ar: 'المعلومات الأساسية', en: 'Basic Information' },
    financialInfo: { ar: 'المعلومات المالية', en: 'Financial Information' },
    salary: { ar: 'رواتب', en: 'Salary' },
    amenities: { ar: 'مرافق', en: 'Amenities' },
    general: { ar: 'عام', en: 'General' },
    management: { ar: 'إدارة', en: 'Management' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    other: { ar: 'أخرى', en: 'Other' },
    notSpecified: { ar: 'غير محدد', en: 'Not Specified' }
  };

  const getCategoryLabel = (categoryId: string) => {
    const categories: Record<string, { ar: string; en: string }> = {
      salary: text.salary,
      amenities: text.amenities,
      general: text.general,
      management: text.management,
      marketing: text.marketing,
      other: text.other
    };
    return categories[categoryId] ? categories[categoryId][language] : categoryId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-pink-700 text-white px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{text.title[language]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`rounded-xl p-4 ${expense.status === 'paid'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500'
            : expense.status === 'pending'
            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-500'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-500'
            }`}>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className={`w-5 h-5 ${expense.status === 'paid' ? 'text-green-600' : expense.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`} />
              <span className={`font-bold text-lg ${expense.status === 'paid' ? 'text-green-700' : expense.status === 'pending' ? 'text-yellow-700' : 'text-red-700'}`}>
                {expense.status === 'paid' ? text.paid[language] : expense.status === 'pending' ? text.pending[language] : text.failed[language]}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.financialInfo[language]}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 border border-red-200 text-center">
                <p className="text-sm text-gray-600 mb-3">{text.amount[language]}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <p className="text-5xl font-bold text-red-600">{expense.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-pink-200 text-center">
                <p className="text-sm text-gray-600 mb-3">{text.currency[language]}</p>
                <p className="text-4xl font-bold text-gray-900">{expense.currency?.code || "USD"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.basicInfo[language]}</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">{text.description[language]}</p>
                <p className="text-lg font-semibold text-gray-900">{expense.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-cyan-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">{text.category[language]}</p>
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {getCategoryLabel(expense.type)}
                  </span>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">{text.date[language]}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{new Date(expense.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">{text.paymentMethod[language]}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {expense.payment_type || text.notSpecified[language]}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              {text.close[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
