import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import WhatsAppPhone from "../../../components/ui/WhatsAppPhone";
import ViewSubscriptionRequestModal from "../../../components/modals/ViewSubscriptionRequestModal";
import CustomSelect from "../../../components/ui/CustomSelect";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { hasPermission } from "../../../utils/auth";
import {
  changeSubscriptionRequestStatus,
  getSubscriptionRequests,
} from "../services/subscriptionRequestServices";

interface SubscriptionRequest {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
   plan: {
    name: string;
    price: number;
    sessionsCount: number;
  };
  requestDate: string;
  rawRequestDate: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export default function SubscriptionRequests() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<SubscriptionRequest | null>(null);
  const itemsPerPage = 10;
  const canUpdateSubscriptionRequests = hasPermission("subscriptions", [
    "update",
    "write",
    "manage",
    "approve",
    "reject",
  ]);

  const text = {
    title: { ar: "طلبات الاشتراك", en: "Subscription Requests" },
    search: {
      ar: "بحث عن اسم الطالب أو ولي الأمر...",
      en: "Search for student or parent name...",
    },
    filter: { ar: "تصفية", en: "Filter" },
    all: { ar: "الكل", en: "All" },
    pending: { ar: "قيد الانتظار", en: "Pending" },
    approved: { ar: "مقبول", en: "Approved" },
    rejected: { ar: "مرفوض", en: "Rejected" },
    studentName: { ar: "اسم الطالب", en: "Student Name" },
    parentName: { ar: "ولي الأمر", en: "Parent Name" },
    phone: { ar: "الهاتف", en: "Phone" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    plan: { ar: "الخطة", en: "Plan" },
    price: { ar: "السعر", en: "Price" },
    sessionsCount: { ar: "عدد الحصص", en: "Sessions Count" },
    session: { ar: "حصة", en: "session" },
    requestDate: { ar: "تاريخ الطلب", en: "Request Date" },
    fromDate: { ar: "من تاريخ الطلب", en: "From Request Date" },
    toDate: { ar: "إلى تاريخ الطلب", en: "To Request Date" },
    clearDate: { ar: "مسح التاريخ", en: "Clear Date" },
    status: { ar: "الحالة", en: "Status" },
    actions: { ar: "الإجراءات", en: "Actions" },
    approve: { ar: "قبول", en: "Approve" },
    reject: { ar: "رفض", en: "Reject" },
    view: { ar: "عرض", en: "View" },
    noRequests: {
      ar: "لا توجد طلبات اشتراك",
      en: "No subscription requests found",
    },
    showing: { ar: "عرض", en: "Showing" },
    of: { ar: "من", en: "of" },
    requests: { ar: "طلب", en: "requests" },
  };

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const data = await getSubscriptionRequests();
        if (!Array.isArray(data)) {
          console.error("Invalid data:", data);
          return;
        }

        const formatted = data.map((item: any) => ({
          id: item.id,
          studentName: typeof item.user?.name === 'string' ? item.user.name : "—",
          parentName: typeof item.user?.name === 'string' ? item.user.name : "—",
          phone: typeof item.user?.phone === 'string' ? item.user.phone : "—",
          email: typeof item.user?.email === 'string' ? item.user.email : "—",
          plan: {
            name: item.plan?.name_ar || item.plan?.name_en || "—",
            price: item.plan?.price || 0,
            sessionsCount: typeof item.plan?.sessionsCount === 'number' ? item.plan.sessionsCount : 0,
          },
          requestDate: typeof item.createdAt === 'string' ? item.createdAt.split("T")[0] : "—",
          rawRequestDate: typeof item.createdAt === 'string' ? item.createdAt : "",
          status: item.status,
        }));
        setRequests(formatted);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const requestDate = new Date(request.rawRequestDate);
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    const matchesFromDate = !from || requestDate >= from;
    const matchesToDate = !to || requestDate <= to;

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleApprove = async (id: string) => {
    if (!canUpdateSubscriptionRequests) return;

    try {
      await changeSubscriptionRequestStatus(id, "approved");
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id: string) => {
    if (!canUpdateSubscriptionRequests) return;

    try {
      await changeSubscriptionRequestStatus(id, "rejected");
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
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
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={text.search[language]}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start transition-all`}
            />
          </div>

          <div className="flex items-center gap-2">
            <CustomSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(
                  value as "all" | "pending" | "approved" | "rejected"
                );
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: text.all[language] },
                { value: "pending", label: text.pending[language] },
                { value: "approved", label: text.approved[language] },
                { value: "rejected", label: text.rejected[language] },
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
          <TableSkeleton rows={itemsPerPage} columns={9} />
        ) : paginatedRequests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{text.noRequests[language]}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
                    {text.requestDate[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.status[language]}
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-semibold text-gray-700">
                    {text.actions[language]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-start text-sm font-medium text-gray-900">
                      {request.studentName}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-600" dir="ltr">
                      <WhatsAppPhone phone={request.phone} />
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-600" dir="ltr">
                      {request.email}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      {request.plan.name}
                    </td>
                    <td className="px-4 py-4 text-start text-sm font-semibold text-gray-900">
                      {request.plan.price}
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      <span className="font-semibold">{request.plan.sessionsCount}</span>{" "}
                      {text.session[language]}
                      
                    </td>
                    <td className="px-4 py-4 text-start text-sm text-gray-900">
                      {request.requestDate}
                    </td>
                    <td className="px-4 py-4 text-start">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {text[request.status][language]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-start">
                        <button
                          onClick={() => handleView(request)}
                          className="p-2 icon-btn-primary rounded-lg transition-colors group"
                          title={text.view[language]}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {canUpdateSubscriptionRequests && (
                          <>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={request.status !== "pending"}
                              className={`p-2 rounded-lg transition-colors ${
                                request.status === "pending"
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                              title={text.reject[language]}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={request.status !== "pending"}
                              className={`p-2 rounded-lg transition-colors ${
                                request.status === "pending"
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                              title={text.approve[language]}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && paginatedRequests.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRequests.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {selectedRequest && (
        <ViewSubscriptionRequestModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}
    </div>
  );
}
