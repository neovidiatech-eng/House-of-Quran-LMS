import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Search, Eye, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import ViewTransactionModal from '../../../components/modals/ViewTransactionModal';
import { useTransactionStats, useTransactions } from '../hooks/useTransaction';
import { Transaction, TransactionType } from '../../../types/transaction';
import { useCurrency } from '../hooks/useCurrency';
import Pagination from '../../../components/ui/Pagination';

export default function Transactions() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const itemsPerPage = 20;
  
  const { data: currenciesData } = useCurrency();
  
  const selectedCurrencyId = useMemo(() => {
    const curr = currenciesData?.currencies?.find(c => c.code === selectedCurrency);
    return curr?.id || '';
  }, [currenciesData, selectedCurrency]);

  const transactionFilters = useMemo(() => ({
    search: searchQuery,
    status: filterStatus,
    type: filterType,
    fromDate,
    toDate,
  }), [searchQuery, filterStatus, filterType, fromDate, toDate]);

  const { data: response, isLoading: transactionsLoading, error } = useTransactions(
    selectedCurrencyId,
    currentPage,
    itemsPerPage,
    transactionFilters,
  );
  const transactions = response?.data?.transactions || [];
  const serverPagination = response?.data?.pagination;

  const { data: statsData, isLoading: statsLoading } = useTransactionStats(selectedCurrencyId);


    const CURRENCIES = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies.map(c => ({
      name: language === 'ar' ? c.name_ar : c.name_en,
      symbol: c.symbol,
      code: c.code,
      rate: c.exchangeRate,
    }));
  }, [currenciesData, language]);



  const text = {
    title: { ar: 'المعاملات المالية', en: 'Financial Transactions' },
    search: { ar: 'بحث في المعاملات...', en: 'Search transactions...' },
    totalRevenue: { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
    totalExpenses: { ar: 'إجمالي المصاريف', en: 'Total Expenses' },
    netProfit: { ar: 'صافي الربح', en: 'Net Profit' },
    pendingTransactions: { ar: 'المعاملات المعلقة', en: 'Pending Transactions' },
    completedTransactions: { ar: 'المعاملات المكتملة', en: 'Completed Transactions' },
    type: { ar: 'النوع', en: 'Type' },
    user: { ar: 'المستخدم', en: 'User' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    date: { ar: 'التاريخ', en: 'Date' },
    status: { ar: 'الحالة', en: 'Status' },
    actions: { ar: 'الإجراءات', en: 'Actions' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    pending: { ar: 'معلق', en: 'Pending' },
    failed: { ar: 'فاشل', en: 'Failed' },
    income: { ar: 'إيراد', en: 'Income' },
    expense: { ar: 'مصروف', en: 'Expense' },
    credit: { ar: 'إيداع', en: 'Credit' },
    debit: { ar: 'سحب', en: 'Debit' },
    subscription: { ar: 'اشتراك', en: 'Subscription' },
    payout: { ar: 'دفعة لمعلم', en: 'Payout' },
    allStatuses: { ar: 'كل الحالات', en: 'All Statuses' },
    allTypes: { ar: 'كل الأنواع', en: 'All Types' },
    fromDate: { ar: 'من تاريخ', en: 'From Date' },
    toDate: { ar: 'إلى تاريخ', en: 'To Date' },
    clearDate: { ar: 'مسح التاريخ', en: 'Clear Date' },
    currency: { ar: 'العملة', en: 'Currency' },
    noTransactions: { ar: 'لا توجد معاملات', en: 'No transactions found' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...' },
    error: { ar: 'حدث خطأ أثناء تحميل البيانات', en: 'Error loading data' }
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case 'credit': return text.credit[language];
      case 'debit': return text.debit[language];
      case 'expense': return text.expense[language];
      case 'subscription': return text.subscription[language];
      case 'payout': return text.payout[language];
      default: return type;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.reason?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesType = filterType === 'all' || t.type === filterType;
      const transactionDate = new Date(t.createdAt);
      const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
      const matchesFromDate = !from || transactionDate >= from;
      const matchesToDate = !to || transactionDate <= to;

      return matchesSearch && matchesStatus && matchesType && matchesFromDate && matchesToDate;
    });
  }, [transactions, searchQuery, filterStatus, filterType, fromDate, toDate]);

  const totalItems = serverPagination?.totalItems ?? filteredTransactions.length;
  const totalPages = Math.max(1, serverPagination?.totalPages ?? Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterType, fromDate, toDate, selectedCurrencyId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    if (statsData) {
      return {
        totalIncome: statsData.totalRevenue || 0,
        totalExpenses: statsData.totalExpenses || 0,
        netProfit: statsData.netProfit || 0,
        pendingCount: statsData.pendingTransactions || 0,
        completedCount: statsData.completedTransactions || 0,
      };
    }
    return { totalIncome: 0, totalExpenses: 0, netProfit: 0, pendingCount: 0, completedCount: 0 };
  }, [statsData]);

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const currentSymbol = getCurrencySymbol(selectedCurrency);
  const profitPercentage = stats.totalIncome > 0 ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1) : '0.0';

  if (transactionsLoading || statsLoading) return <div className="p-6 text-center">{text.loading[language]}</div>;
  if (error) return <div className="p-6 text-center text-red-600">{text.error[language]}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{text.title[language]}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl bg-white">
            {/* <DollarSign className="w-4 h-4 text-gray-500" /> */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">{text.totalRevenue[language]}</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.totalIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{currentSymbol}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600">{text.totalExpenses[language]}</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{currentSymbol}</p>
        </div>

        <div className={`rounded-2xl p-5 border shadow-sm ${stats.netProfit >= 0 ? 'bg-primary-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${stats.netProfit >= 0 ? 'bg-primary-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-5 h-5 ${stats.netProfit >= 0 ? 'text-primary' : 'text-red-600'}`} />
            </div>
            <p className="text-sm text-gray-600">{text.netProfit[language]}</p>
          </div>
          <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
            {stats.netProfit.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {currentSymbol} — <span className={stats.netProfit >= 0 ? 'text-primary font-semibold' : 'text-red-600 font-semibold'}>{profitPercentage}%</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">{text.completedTransactions[language]}</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completedCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">{text.pendingTransactions[language]}</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={text.search[language]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white appearance-none"
          >
            <option value="all">{text.allTypes[language]}</option>
            <option value="credit">{text.credit[language]}</option>
            <option value="debit">{text.debit[language]}</option>
            <option value="expense">{text.expense[language]}</option>
            <option value="payout">{text.payout[language]}</option>
            <option value="subscription">{text.subscription[language]}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white appearance-none"
          >
            <option value="all">{text.allStatuses[language]}</option>
            <option value="completed">{text.completed[language]}</option>
            <option value="pending">{text.pending[language]}</option>
            <option value="failed">{text.failed[language]}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">{text.fromDate[language]}</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">{text.toDate[language]}</span>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white"
          />
        </label>
      </div>

      {(fromDate || toDate) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            {text.clearDate[language]}
          </button>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{text.noTransactions[language]}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{text.type[language]}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{text.amount[language]}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{text.date[language]}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{text.status[language]}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{text.actions[language]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-start">
                        <span className={`text-sm font-medium ${transaction.type === 'credit' || transaction.type === 'subscription' ? 'text-green-700' : 'text-orange-700'}`}>
                          {getTransactionLabel(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-start">
                      <span className="text-sm text-gray-900">{transaction.reason || '-'}</span>
                    </td>
                    <td className="px-5 py-4 text-start">
                      <div className="flex items-center gap-1 justify-start">
                        <span className={`text-sm font-bold ${transaction.type === 'credit' || transaction.type === 'subscription' ? 'text-green-600' : 'text-orange-600'}`}>
                          {(transaction.convertedAmount ?? 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">{currentSymbol}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-start">
                      <span className="text-sm text-gray-900">{new Date(transaction.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {text[transaction.status] ? text[transaction.status][language] : transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleView(transaction)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {showViewModal && selectedTransaction && (
        <ViewTransactionModal
          isOpen={showViewModal}
          onClose={() => { setShowViewModal(false); setSelectedTransaction(null); }}
          transaction={selectedTransaction}
          currencies={CURRENCIES}
          selectedCurrency={selectedCurrency}
        />
      )}
    </div>
  );
}
