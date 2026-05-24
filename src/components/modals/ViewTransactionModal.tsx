import { X , TrendingUp, TrendingDown, Calendar, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Transaction } from '../../types/transaction';

interface ViewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  currencies: { code: string; symbol: string; rate: number }[];
  selectedCurrency: string;
}

export default function ViewTransactionModal({ isOpen, onClose, transaction, currencies, selectedCurrency }: ViewTransactionModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'تفاصيل المعاملة', en: 'Transaction Details' },
    type: { ar: 'النوع', en: 'Type' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    date: { ar: 'التاريخ', en: 'Date' },
    status: { ar: 'الحالة', en: 'Status' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    pending: { ar: 'معلق', en: 'Pending' },
    failed: { ar: 'فاشل', en: 'Failed' },
    reason: { ar: 'السبب', en: 'Reason' },
    walletId: { ar: 'رقم المحفظة', en: 'Wallet ID' },
    subscriptionId: { ar: 'رقم الاشتراك', en: 'Subscription ID' },
    convertedAmount: { ar: 'المبلغ المحوّل', en: 'Converted Amount' },
    close: { ar: 'إغلاق', en: 'Close' },
    credit: { ar: 'إيداع', en: 'Credit' },
    debit: { ar: 'سحب', en: 'Debit' },
    subscription: { ar: 'اشتراك', en: 'Subscription' },
    expense: { ar: 'مصروف', en: 'Expense' },
  };

  const currentSymbol = currencies.find(c => c.code === selectedCurrency)?.symbol || selectedCurrency;
  const originalSymbol = currencies.find(c => c.code === transaction.currencyCode)?.symbol || transaction.currencyCode;

  if (!isOpen) return null;

  const isIncome = transaction.type === 'credit' || transaction.type === 'subscription';

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`sticky top-0 px-6 py-5 flex items-center justify-between rounded-t-2xl ${isIncome ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'
          } text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              {isIncome ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">{text.title[language]}</h2>
              <p className="text-sm opacity-80">{text[transaction.type as keyof typeof text] ? text[transaction.type as keyof typeof text][language] : transaction.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`rounded-xl p-5 text-center ${isIncome ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            <p className="text-sm text-gray-600 mb-2">{text.amount[language]}</p>
            <p className={`text-5xl font-bold ${isIncome ? 'text-green-600' : 'text-orange-600'}`}>
              {(transaction.convertedAmount ?? 0).toFixed(2)} <span className="text-2xl">{currentSymbol}</span>
            </p>
            {transaction.currencyCode !== selectedCurrency && (
              <p className="text-sm text-gray-500 mt-2">
                {text.convertedAmount[language]}: <span className="font-semibold">{(transaction.originalAmount ?? 0).toFixed(2)} {originalSymbol}</span>
              </p>
            )}
            <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-medium ${transaction.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : transaction.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {text[transaction.status] ? text[transaction.status][language] : transaction.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{text.date[language]}</p>
              </div>
              <p className="font-semibold text-gray-900">{new Date(transaction.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
            </div>


            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{text.type[language]}</p>
              </div>
              <p className="font-semibold text-gray-900">{text[transaction.type] ? text[transaction.type][language] : transaction.type}</p>
            </div>
          </div>

          {transaction.reason && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-start">
              <p className="text-sm text-gray-600 mb-2">{text.reason[language]}</p>
              <p className="text-gray-900">{transaction.reason}</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 font-medium"
            >
              {text.close[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
