import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, Eye, Calendar, User, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import CustomSelect from '../../../components/ui/CustomSelect';
import { useRequests, useChangeRequestStatus } from '../hooks/useRequests';
import { RequestStatus, RequestType, UserRequest } from '../../../types/requests';

const REQUEST_TYPES: Record<RequestType, { ar: string; en: string; color: string }> = {
  reschedule: {
    ar: 'إعادة جدولة',
    en: 'Reschedule',
    color: 'bg-primary-100 text-blue-700'
  },
  cancel: {
    ar: 'إلغاء',
    en: 'Cancel',
    color: 'bg-red-100 text-red-700'
  },
  other: {
    ar: 'أخرى',
    en: 'Other',
    color: 'bg-gray-100 text-gray-700'
  }
};



export default function TeacherRequests() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<RequestType | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'approve' | 'reject' | null; requestId: string | null }>({
    isOpen: false,
    type: null,
    requestId: null
  });
  const [adminNotes, setAdminNotes] = useState('');


  const { data, isLoading, isError } = useRequests();
  const { mutate: changeStatus, isPending: isUpdating } = useChangeRequestStatus();

  const requests = data?.data || [];

  const filtered = requests.filter(r => {
    const matchSearch = r.requester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const handleApprove = (id: string) => {
    setActionModal({ isOpen: true, type: 'approve', requestId: id });
    setAdminNotes('');
  };

  const handleReject = (id: string) => {
    setActionModal({ isOpen: true, type: 'reject', requestId: id });
    setAdminNotes('');
  };

  const handleConfirmAction = () => {
    if (!actionModal.requestId || !actionModal.type) return;
    changeStatus({
      id: actionModal.requestId,
      status: actionModal.type,
      adminNotes
    });
    setActionModal({ isOpen: false, type: null, requestId: null });
    setAdminNotes('');
    if (selectedRequest?.id === actionModal.requestId) setSelectedRequest(null);
  };




  const getStatusBadge = (status: RequestStatus) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };


  const getStatusLabel = (status: RequestStatus) => {
    const labels: Record<RequestStatus, { ar: string; en: string }> = {
      pending: { ar: 'معلق', en: 'Pending' },
      approved: { ar: 'مقبول', en: 'Approved' },
      rejected: { ar: 'مرفوض', en: 'Rejected' },
    };
    return labels[status][language];
  };


  const statusFilterOptions = [
    { value: 'all', label: language === 'ar' ? 'كل الحالات' : 'All Statuses' },
    { value: 'pending', label: language === 'ar' ? 'معلق' : 'Pending' },
    { value: 'approved', label: language === 'ar' ? 'مقبول' : 'Approved' },
    { value: 'rejected', label: language === 'ar' ? 'مرفوض' : 'Rejected' },
    { value: 'cancelled', label: language === 'ar' ? 'ملغي' : 'Cancelled' },
  ];


  const typeFilterOptions = [
    { value: 'all', label: language === 'ar' ? 'كل الأنواع' : 'All Types' },
    ...(Object.keys(REQUEST_TYPES) as RequestType[]).map((t) => ({
      value: t,
      label: REQUEST_TYPES[t][language],
    })),
  ];

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === 'ar' ? 'طلبات المستخدمين' : 'Users Requests'}</h1>
          <p className="text-gray-500 text-sm mt-1">{language === 'ar' ? 'إجازات، استئذانات، وطلبات أخرى' : 'Leaves, permissions, and other requests'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{language === 'ar' ? 'بانتظار المراجعة' : 'Pending'}</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{language === 'ar' ? 'مقبولة' : 'Approved'}</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{language === 'ar' ? 'مرفوضة' : 'Rejected'}</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث باسم المعلم...' : 'Search teacher name...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-start"
          />
        </div>

        <CustomSelect
          value={filterStatus}
          options={statusFilterOptions}
          onChange={(val) => setFilterStatus(val as 'all' | RequestStatus)}
        />

        <CustomSelect
          value={filterType}
          options={typeFilterOptions}
          onChange={(val) => setFilterType(val as 'all' | RequestType)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-500">{language === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading requests...'}</p>
          </div>
        ) : isError ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-500">{language === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load requests'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{language === 'ar' ? 'لا توجد طلبات' : 'No requests found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'نوع الطلب' : 'Type'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'الدور' : 'Role'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'الفترة' : 'Period'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'السبب' : 'Reason'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-5 py-4 text-start text-sm font-semibold text-gray-800">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 justify-start">
                        <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{request.requester.name}</p>
                          <p className="text-xs text-gray-400">{request.schedule.title}</p>
                        </div>

                      </div>
                    </td>
                    <td className="px-5 py-4 text-start">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${REQUEST_TYPES[request.type].color}`}>
                        {REQUEST_TYPES[request.type][language]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-start">
                      {request.requesterRole}
                    </td>
                    <td className="px-5 py-4 text-start">
                      <p className="text-sm text-gray-900">{new Date(request.schedule.start_time).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.schedule.start_time).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-start">
                      <p className="text-sm text-gray-900">{request.reason}</p>
                    </td>
                    <td className="px-5 py-4 text-start">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-start">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title={language === 'ar' ? 'عرض' : 'View'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={isUpdating}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title={language === 'ar' ? 'قبول' : 'Approve'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={isUpdating}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={language === 'ar' ? 'رفض' : 'Reject'}
                            >
                              <XCircle className="w-4 h-4" />
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
      </div>


      {selectedRequest && (
        <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">{language === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 justify-start">
                <div className="text-start">
                  <p className="font-bold text-gray-900 text-lg">{selectedRequest.requester.name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.schedule.title}</p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-start">
                  <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'نوع الطلب' : 'Type'}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${REQUEST_TYPES[selectedRequest.type].color}`}>
                    {REQUEST_TYPES[selectedRequest.type][language]}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-start">
                  <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-start">
                  <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'التوقيت الحالي' : 'Current Time'}</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {new Date(selectedRequest.schedule.start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                {selectedRequest.type === 'reschedule' && (
                  <div className="bg-primary-50 rounded-xl p-3 text-start border border-blue-100">
                    <p className="text-xs text-blue-600 mb-1">{language === 'ar' ? 'الموعد المقترح' : 'Suggested Time'}</p>
                    <p className="font-bold text-blue-700 text-sm">
                      {new Date(selectedRequest.requestedData.new_start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-start">
                <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'السبب' : 'Reason'}</p>
                <p className="text-gray-800 text-sm">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.type === 'reschedule' && selectedRequest.requestedData.suggested_notes && (
                <div className="bg-yellow-50 rounded-xl p-4 text-start border border-yellow-100">
                  <p className="text-xs text-yellow-600 mb-1">{language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}</p>
                  <p className="text-yellow-800 text-sm">{selectedRequest.requestedData.suggested_notes}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { handleReject(selectedRequest.id); setSelectedRequest(null); }}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {language === 'ar' ? 'رفض' : 'Reject'}
                  </button>
                  <button
                    onClick={() => { handleApprove(selectedRequest.id); setSelectedRequest(null); }}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {language === 'ar' ? 'قبول' : 'Approve'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {actionModal.isOpen && (
        <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={() => setActionModal({ ...actionModal, isOpen: false })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-4 flex items-center justify-between border-b ${actionModal.type === 'approve' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`font-bold text-lg ${actionModal.type === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                {actionModal.type === 'approve'
                  ? (language === 'ar' ? 'قبول الطلب' : 'Approve Request')
                  : (language === 'ar' ? 'رفض الطلب' : 'Reject Request')
                }
              </h3>
              <button onClick={() => setActionModal({ ...actionModal, isOpen: false })} className="p-1 hover:bg-white/50 rounded-lg transition-colors">
                <XCircle className={`w-5 h-5 ${actionModal.type === 'approve' ? 'text-green-400' : 'text-red-400'}`} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block text-start">
                  {actionModal.type === 'approve'
                    ? (language === 'ar' ? 'ملاحظات الإدارة' : 'Admin Notes')
                    : (language === 'ar' ? 'سبب الرفض' : 'Rejection Reason')
                  }
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب هنا...' : 'Type here...'}
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-start"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                  className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isUpdating}
                  className={`flex-1 py-3 px-4 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${actionModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {actionModal.type === 'approve' ? (language === 'ar' ? 'تأكيد القبول' : 'Confirm Approval') : (language === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
