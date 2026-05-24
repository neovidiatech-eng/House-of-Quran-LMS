import { useEffect, useMemo, useState } from "react";
import { useConfirm } from '../../../hooks/useConfirm';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Search,
  CreditCard,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import AddExpenseModal from "../../../components/modals/AddExpenseModal";
import ViewExpenseModal from "../../../components/modals/ViewExpenseModal";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "../hooks/useExpenses";
import { Expense } from "../../../types/expenses";
import { message } from "antd";
import { useCurrency } from "../hooks/useCurrency";
import Pagination from "../../../components/ui/Pagination";

export default function Expenses() {
  const { language } = useLanguage();
  const { confirm, ConfirmDialog } = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: currenciesData } = useCurrency();
    
    const selectedCurrencyId = useMemo(() => {
      const curr = currenciesData?.currencies?.find(c => c.code === selectedCurrency);
      return curr?.code || '';
    }, [currenciesData, selectedCurrency]);

  const expenseFilters = useMemo(() => ({
    search: searchQuery,
    fromDate,
    toDate,
  }), [searchQuery, fromDate, toDate]);

  const { data: expensesData, isLoading } = useExpenses(
    selectedCurrencyId,
    currentPage,
    itemsPerPage,
    expenseFilters,
  );
  const expenses = expensesData?.expenses || [];
  const pagination = expensesData?.pagination;
  const totalExpenses = expensesData?.totalExpenses || 0;

  
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const text = {
    title: { ar: "إدارة المصروفات", en: "Expenses Management" },
    addExpense: { ar: "إضافة مصروف جديد", en: "Add New Expense" },
    search: { ar: "البحث في المصروفات...", en: "Search expenses..." },
    totalExpenses: { ar: "إجمالي المصروفات", en: "Total Expenses" },
    totalCount: { ar: "مصروف", en: "expenses" },
    description: { ar: "الوصف", en: "Description" },
    amount: { ar: "المبلغ", en: "Amount" },
    currency: { ar: "العملة", en: "Currency" },
    type: { ar: "النوع", en: "Type" },
    date: { ar: "التاريخ", en: "Date" },
    paymentMethod: { ar: "طريقة الدفع", en: "Payment Method" },
    status: { ar: "الحالة", en: "Status" },
    actions: { ar: "الإجراءات", en: "Actions" },
    edit: { ar: "تعديل", en: "Edit" },
    delete: { ar: "حذف", en: "Delete" },
    view: { ar: "عرض", en: "View" },
    paid: { ar: "مقبول", en: "Paid" },
    pending: { ar: "معلق", en: "Pending" },
    failed: { ar: "فاشل", en: "Failed" },
    noExpenses: { ar: "لا توجد مصروفات", en: "No expenses found" },
    confirmDelete: {
      ar: "هل أنت متأكد من حذف هذا المصروف؟",
      en: "Are you sure you want to delete this expense?",
    },
    allTypes: { ar: "كل الأنواع", en: "All Types" },
    salary: { ar: "رواتب", en: "Salary" },
    amenities: { ar: "مرافق", en: "Amenities" },
    general: { ar: "عام", en: "General" },
    management: { ar: "إدارة", en: "Management" },
    marketing: { ar: "تسويق", en: "Marketing" },
    other: { ar: "أخرى", en: "Other" },
    allStatuses: { ar: "كل الحالات", en: "All Statuses" },
    allCurrencies: { ar: "كل العملات", en: "All Currencies" },
    fromDate: { ar: "من تاريخ", en: "From Date" },
    toDate: { ar: "إلى تاريخ", en: "To Date" },
    clearDate: { ar: "مسح التاريخ", en: "Clear Date" },
  };
 const CURRENCIES = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies.map(c => ({
      name: language === 'ar' ? c.name_ar : c.name_en,
      symbol: c.symbol,
      code: c.code,
      rate: c.exchangeRate,
    }));
  }, [currenciesData, language]);

 const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.code || code;
  };

  

  const handleSaveExpense = async (expenseData: any) => {
    try {
      if (selectedExpense) {
        await updateMutation.mutateAsync({ id: selectedExpense.id, data: expenseData });
        message.success(language === 'ar' ? 'تم تحديث المصروف بنجاح' : 'Expense updated successfully');
      } else {
        await createMutation.mutateAsync(expenseData);
        message.success(language === 'ar' ? 'تم إضافة المصروف بنجاح' : 'Expense added successfully');
      }
      setShowModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const ok = await confirm({
      title: language === 'ar' ? 'حذف المصروف' : 'Delete Expense',
      message: text.confirmDelete[language],
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
      message.success(language === 'ar' ? 'تم حذف المصروف بنجاح' : 'Expense deleted successfully');
    } catch (error) {
      message.error(language === 'ar' ? 'حدث خطأ ما' : 'Something went wrong');
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFromDate = !from || expenseDate >= from;
    const matchesToDate = !to || expenseDate <= to;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const totalItems = pagination?.totalItems ?? filteredExpenses.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCurrencyId, searchQuery, fromDate, toDate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalAmount = totalExpenses;

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {text.title[language]}
                </h1>
                <p className="text-sm text-gray-500">
                  {totalItems} {text.totalCount[language]}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 hover:bg-white transition-colors">
              <DollarSign className="w-5 h-5 text-primary" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="text-sm font-semibold text-gray-700 bg-transparent border-none outline-none cursor-pointer appearance-none pr-6"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedExpense(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 w-fit"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">{text.addExpense[language]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {text.totalExpenses[language]}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold text-gray-900">
                {totalAmount.toLocaleString()}
              </h2>
              <span className="text-sm font-medium text-gray-400">{getCurrencySymbol(selectedCurrency)}</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-red-50/50 to-transparent" />
      </div>

{/* Search */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div className="relative">
          <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="text"
            placeholder={text.search[language]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 ${language === 'ar' ? 'pr-12 pl-5' : 'pl-12 pr-5'} outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start`}
          />
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={7} />
        ) : filteredExpenses.length === 0 ? (
          <div className="py-20 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">{text.noExpenses[language]}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.description[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.type[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.amount[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.paymentMethod[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.date[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.status[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.actions[language]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-gray-900">
                        {expense.title}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-blue-700">
                        {text[expense.type as keyof typeof text]?.[language] || expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-red-600">
                          {expense.convertedAmount ? expense.convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : expense.amount.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-gray-400 uppercase">
                          {getCurrencySymbol(expense.convertedCurrency?.code || expense.currency?.code || selectedCurrency)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600">
                        {expense.payment_type || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(expense.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          expense.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : expense.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {text[expense.status as keyof typeof text]?.[language] || expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowViewModal(true);
                          }}
                          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          title={text.view[language]}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowModal(true);
                          }}
                          className="w-10 h-10 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center hover:bg-amber-100 transition-colors"
                          title={text.edit[language]}
                        >
                          <Edit className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title={text.delete[language]}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filteredExpenses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AddExpenseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={selectedExpense}
      />

      {showViewModal && selectedExpense && (
        <ViewExpenseModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
