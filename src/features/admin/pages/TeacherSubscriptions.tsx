import { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Eye, UserCheck, Users, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Pagination from '../../../components/ui/Pagination';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useConfirm } from '../../../hooks/useConfirm';
import {
  useTeacherSubscriptionRequests,
  useApproveTeacherSubscriptionRequest,
  useRejectTeacherSubscriptionRequest,
} from '../hooks/useTeacherSubscription';
import { TeacherSubscriptionRequest, ApproveTeacherRequestBody } from '../../../types/teacherSubscription';
import ApproveTeacherRequestModal from '../../../components/modals/ApproveTeacherRequestModal';
import ViewTeacherSubscriptionModal from '../../../components/modals/ViewTeacherSubscriptionModal';

export default function TeacherSubscriptions() {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestToApprove, setSelectedRequestToApprove] = useState<TeacherSubscriptionRequest | null>(null);
  const [selectedRequestToView, setSelectedRequestToView] = useState<TeacherSubscriptionRequest | null>(null);
  const itemsPerPage = 10;

  const { data: requests = [], isLoading, isError } = useTeacherSubscriptionRequests();
  const approveMutation = useApproveTeacherSubscriptionRequest();
  const rejectMutation = useRejectTeacherSubscriptionRequest();
  const { confirm, ConfirmDialog } = useConfirm();

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const name = (req.name || req.user?.name || '').toLowerCase();
      const email = (req.email || req.user?.email || '').toLowerCase();
      const phone = req.phone || req.user?.phone || '';
      const query = searchTerm.toLowerCase();

      return name.includes(query) || email.includes(query) || phone.includes(searchTerm);
    });
  }, [requests, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenApproveModal = (req: TeacherSubscriptionRequest) => {
    setSelectedRequestToApprove(req);
  };

  const handleApproveSubmit = async (data: ApproveTeacherRequestBody) => {
    if (!selectedRequestToApprove) return;
    await approveMutation.mutateAsync({
      id: selectedRequestToApprove.id,
      data,
    });
    setSelectedRequestToApprove(null);
  };

  const handleReject = async (req: TeacherSubscriptionRequest) => {
    const teacherName = req.name || req.user?.name || '';
    const confirmed = await confirm({
      title: language === 'ar' ? 'رفض طلب التسجيل' : 'Reject Signup Request',
      message: language === 'ar'
        ? `هل أنت تأكد من رفض طلب تسجيل المعلم "${teacherName}"؟`
        : `Are you sure you want to reject registration request for "${teacherName}"?`,
    });

    if (confirmed) {
      try {
        await rejectMutation.mutateAsync(req.id);
      } catch (err: any) {
        console.error('Error rejecting teacher request:', err);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="text-start">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'طلبات تسجيل المعلمين' : 'Teacher Registration Requests'}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            {language === 'ar'
              ? 'مراجعة واعتماد طلبات الانضمام والتسجيل الخاصة بالمعلمين'
              : 'Review and approve teacher onboarding registration requests'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-start">
              <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'إجمالي الطلبات المعلقة' : 'Pending Requests'}</p>
              <p className="text-3xl font-bold text-amber-600">{requests.length}</p>
            </div>
            <div className="bg-amber-50 w-14 h-14 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-start">
              <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'النتائج في الصفحة' : 'Current Page Requests'}</p>
              <p className="text-3xl font-bold text-blue-600">{currentRequests.length}</p>
            </div>
            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-start">
              <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'حالة الخدمة' : 'Service Status'}</p>
              <p className="text-base font-bold text-green-600">{language === 'ar' ? 'نشط وتعمل' : 'Active'}</p>
            </div>
            <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث بالاسم، البريد الإلكتروني، أو الهاتف...' : 'Search by name, email, or phone...'}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start`}
          />
          <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={6} />
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p>{language === 'ar' ? 'حدث خطأ أثناء تحميل الطلبات' : 'Error loading requests'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {language === 'ar' ? 'معلومات المعلم' : 'Teacher Info'}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('email')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('phone')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {language === 'ar' ? 'الدولة / المدينة' : 'Country / City'}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {language === 'ar' ? 'لا توجد طلبات تسجيل معلمين' : 'No teacher registration requests found'}
                    </td>
                  </tr>
                ) : (
                  currentRequests.map((req) => {
                    const name = req.name || req.user?.name || '-';
                    const email = req.email || req.user?.email || '-';
                    const phone = req.phone || req.user?.phone || '';
                    const codeCountry = req.codeCountry || req.code_country || req.user?.code_country || '';
                    const country = req.country || req.user?.country || '-';
                    const city = req.city || req.user?.city || '';
                    const regDate = req.createdAt || req.user?.createdAt;

                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 justify-start">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <UserCheck className="w-5 h-5 text-amber-700" />
                            </div>
                            <div className="text-start">
                              <div className="text-sm font-bold text-gray-900">{name}</div>
                              {req.nationality && (
                                <span className="text-xs text-gray-400">{req.nationality}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-start">
                          <span className="text-sm text-gray-600">{email}</span>
                        </td>

                        <td className="px-6 py-4 text-start">
                          <WhatsAppPhone
                            phone={`${codeCountry} ${phone}`.trim()}
                            className="text-sm text-green-600 hover:text-green-700"
                          />
                        </td>

                        <td className="px-6 py-4 text-start">
                          <span className="text-sm text-gray-700">
                            {country} {city ? `(${city})` : ''}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-start">
                          <span className="text-sm text-gray-500">
                            {regDate ? new Date(regDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-start">
                            <button
                              onClick={() => setSelectedRequestToView(req)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                              title={t('view')}
                            >
                              <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            </button>

                            <button
                              onClick={() => handleOpenApproveModal(req)}
                              disabled={approveMutation.isPending}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                              title={language === 'ar' ? 'قبول واعتماد' : 'Approve'}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'قبول' : 'Approve'}</span>
                            </button>

                            <button
                              onClick={() => handleReject(req)}
                              disabled={rejectMutation.isPending}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                              title={language === 'ar' ? 'رفض الطلب' : 'Reject'}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'رفض' : 'Reject'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRequests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Approve Modal */}
      <ApproveTeacherRequestModal
        isOpen={!!selectedRequestToApprove}
        onClose={() => setSelectedRequestToApprove(null)}
        onSubmit={handleApproveSubmit}
        request={selectedRequestToApprove}
        isSubmitting={approveMutation.isPending}
      />

      {/* View Modal */}
      <ViewTeacherSubscriptionModal
        isOpen={!!selectedRequestToView}
        onClose={() => setSelectedRequestToView(null)}
        request={selectedRequestToView}
        onApprove={(req) => handleOpenApproveModal(req)}
      />

      {ConfirmDialog}
    </div>
  );
}
