import { useMemo, useState } from "react";
import { Search, Eye, CreditCard } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import ViewSubscriptionDetailsModal from "../../../components/modals/ViewSubscriptionDetailsModal";
import PlanSelectionModal from "../../../components/modals/PlanSelectionModal";
import CustomSelect from "../../../components/ui/CustomSelect";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { useRenewSubscription, useSubscription } from "../hooks/useSubscription";
import { SubscriptionData } from "../../../types/subscription";
import WhatsAppPhone from "../../../components/ui/WhatsAppPhone";

interface Subscription {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  country: string;
  gender: string;
  planName: string;
  planPrice: string;
  currencyName: string;
  startDate: string;
  rawStartDate: string;
  paidAt: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  sessionsRemaining: number;
  totalSessions: number;
  attendedSessions: number;
  avgRating: number;
  totalReviews: number;
  sessionTime: number;
}

export default function AllSubscriptions() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "cancelled"
  >("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [renewSubData, setRenewSubData] = useState<SubscriptionData | null>(null);

  const itemsPerPage = 10;

  const { data, isLoading } = useSubscription();
  const { mutate: renewSubscription } = useRenewSubscription();

  const handleRenew = (id: string) => {
    const originalSub = data?.find((s: SubscriptionData) => s.id === id);
    if (!originalSub) return;
    setRenewSubData(originalSub);
    setShowPlanModal(true);
  };

  const text = {
    title: { ar: "كل الاشتراكات", en: "All Subscriptions" },
    search: {
      ar: "بحث عن اسم الطالب أو الخطة...",
      en: "Search for student name or plan...",
    },
    filter: { ar: "تصفية", en: "Filter" },
    all: { ar: "الكل", en: "All" },
    active: { ar: "نشط", en: "Active" },
    expired: { ar: "منتهي", en: "Expired" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    studentName: { ar: "اسم الطالب", en: "Student Name" },
    phone: { ar: "رقم الهاتف", en: "Phone" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    plan: { ar: "الخطة", en: "Plan" },
    price: { ar: "السعر", en: "Price" },
    sessionsCount: { ar: "عدد الحصص", en: "Sessions Count" },
    session: { ar: "حصة", en: "session" },
    startDate: { ar: "تاريخ البدء", en: "Start Date" },
    fromDate: { ar: "من تاريخ البدء", en: "From Start Date" },
    toDate: { ar: "إلى تاريخ البدء", en: "To Start Date" },
    clearDate: { ar: "مسح التاريخ", en: "Clear Date" },
    status: { ar: "الحالة", en: "Status" },
    progress: { ar: "التقدم", en: "Progress" },
    actions: { ar: "الإجراءات", en: "Actions" },
    edit: { ar: "تعديل", en: "Edit" },
    delete: { ar: "حذف", en: "Delete" },
    view: { ar: "عرض", en: "View" },
    noSubscriptions: { ar: "لا توجد اشتراكات", en: "No subscriptions found" },
    showing: { ar: "عرض", en: "Showing" },
    of: { ar: "من", en: "of" },
    subscriptions: { ar: "اشتراك", en: "subscriptions" },
    sessions: { ar: "حصة", en: "sessions" },
    confirmDelete: {
      ar: "هل أنت متأكد من حذف هذا الاشتراك؟",
      en: "Are you sure you want to delete this subscription?",
    },
    renewSubscription: { ar: "تجديد الاشتراك", en: "Renew Subscription" }
  };

  const mapApiToSubscription = (apiData: SubscriptionData): Subscription => {
    const startDate = new Date(apiData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (apiData.plan?.duration || 30));

    return {
      id: apiData.id,
      studentName: apiData.user?.name || "—",
      email: apiData.user?.email || "—",
      phone: `${apiData.user?.code_country || ""} ${apiData.user?.phone || ""}`.trim(),
      country: apiData.student?.country || "—",
      gender: apiData.student?.gender || "—",
      planName: language === "ar" ? apiData.plan?.name_ar : apiData.plan?.name_en || "—",
      planPrice: `${apiData.amount} ${apiData.currency?.symbol || ""}`,
      currencyName: (language === "ar" ? apiData.currency?.name_ar : apiData.currency?.name_en) || apiData.currency?.code || "—",
      startDate: startDate.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US"),
      rawStartDate: apiData.startDate,
      paidAt: apiData.paidAt
        ? new Date(apiData.paidAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
        : "—",
      endDate: endDate.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US"),
      status: (apiData.status as any) || "active",
      sessionsRemaining: apiData.student?.sessions_remaining ?? 0,
      totalSessions: apiData.student?.sessions ?? apiData.plan?.sessionsCount ?? 0,
      attendedSessions: apiData.student?.sessions_attended ?? 0,
      avgRating: apiData.student?.avgRating ?? 0,
      totalReviews: apiData.student?.totalReviews ?? 0,
      sessionTime: apiData.plan?.sessionTime ?? 0,
    };
  };

  const formattedSubscriptions = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(mapApiToSubscription);
  }, [data, language]);

  const filteredSubscriptions = formattedSubscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.phone.includes(searchTerm) ||
      subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    const subscriptionStartDate = new Date(subscription.rawStartDate);
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    const matchesFromDate = !from || subscriptionStartDate >= from;
    const matchesToDate = !to || subscriptionStartDate <= to;

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "expired":
        return "bg-red-50 text-red-700 border-red-200";
      case "cancelled":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const calculateProgress = (attended: number, total: number) => {
    if (total === 0) return 0;
    return (attended / total) * 100;
  };

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewModal(true);
  };

  const handleConfirmPlan = (planId: string) => {
    if (renewSubData) {
      renewSubscription({
        studentId: renewSubData.student.id,
        plan_id: planId,
      });
      setShowPlanModal(false);
      setRenewSubData(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {text.title[language]}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={text.search[language]}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
            />
          </div>
          <div className="w-full md:w-[220px]">
            <CustomSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(
                  value as "all" | "active" | "expired" | "cancelled",
                );
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: text.all[language] },
                { value: "active", label: text.active[language] },
                { value: "expired", label: text.expired[language] },
                { value: "cancelled", label: text.cancelled[language] },
              ]}
              placeholder={text.filter[language]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">{text.fromDate[language]}</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">{text.toDate[language]}</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white"
            />
          </label>
        </div>

        {(fromDate || toDate) && (
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setCurrentPage(1);
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              {text.clearDate[language]}
            </button>
          </div>
        )}

        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={10} />
        ) : paginatedSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {text.noSubscriptions[language]}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.studentName[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.phone[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.email[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.plan[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.price[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.sessionsCount[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.startDate[language]}
                  </th>

                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.status[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.progress[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.actions[language]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSubscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-start text-sm font-medium text-gray-900">
                      {subscription.studentName}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      {subscription.phone ? (
                        <WhatsAppPhone
                          phone={subscription.phone}
                          className="text-sm text-green-600 hover:text-green-700"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      {subscription.email}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      {subscription.planName}
                    </td>
                    <td className="px-4 py-4 text-start text-sm font-semibold text-gray-900">
                      {subscription.planPrice}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      <span className="font-semibold">
                        {subscription.totalSessions}
                      </span>{" "}
                      {text.session[language]}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      {subscription.startDate}
                    </td>
                    <td className="px-4 py-4 text-start">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          subscription.status
                        )}`}
                      >
                        {text[subscription.status][language]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-start">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            {subscription.attendedSessions}/
                            {subscription.totalSessions}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${calculateProgress(
                                subscription.attendedSessions,
                                subscription.totalSessions
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-2 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                        <button
                          onClick={() => handleView(subscription)}
                          className="p-2 icon-btn-primary rounded-lg transition-colors group"
                          title={text.view[language]}
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {subscription.sessionsRemaining === 0 && (
                          <button
                            onClick={() => handleRenew(subscription.id)}
                            className="p-2 bg-primary text-sm text-white rounded-lg hover:bg-green-200 transition"
                            title={text.renewSubscription[language]}
                          >
                            {text.renewSubscription[language]}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && paginatedSubscriptions.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredSubscriptions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {selectedSubscription && (
        <>
          <ViewSubscriptionDetailsModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
          />
        </>
      )}
      {showPlanModal && (
        <PlanSelectionModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onConfirm={handleConfirmPlan}
        />
      )}
    </div>
  );
}
