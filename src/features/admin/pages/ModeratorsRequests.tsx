import { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Clock, Eye, AlertCircle, Users, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import {
  useModeratorsRequests,
  useAcceptModeratorRequest,
  useRejectModeratorRequest,
  useUpdateModerator,
  useDeleteModerator,
} from '../hooks/useModerators';
import { Moderator, ModeratorRequest, UpdateModeratorInput } from '../../../types/moderator';
import ViewModeratorRequestModal from '../../../components/modals/ViewModeratorRequestModal';
import ConfirmModeratorRequestModal from '../../../components/modals/ConfirmModeratorRequestModal';
import EditModeratorModal from '../../../components/modals/EditModeratorModal';
import { useConfirm } from '../../../hooks/useConfirm';

export default function ModeratorsRequests() {
  const { i18n } = useTranslation();
  const language = i18n?.language?.split('-')[0] || 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ModeratorRequest | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'reject' | null;
    userId: string | null;
  }>({ isOpen: false, type: null, userId: null });
  const [editRequest, setEditRequest] = useState<ModeratorRequest | null>(null);

  const { data, isLoading, isError } = useModeratorsRequests();
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptModeratorRequest();
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectModeratorRequest();
  const { mutate: updateModerator, isPending: isUpdating } = useUpdateModerator();
  const { mutate: deleteModerator, isPending: isDeleting } = useDeleteModerator();
  const { confirm, ConfirmDialog } = useConfirm();

  const isActing = isAccepting || isRejecting;

  const requests: ModeratorRequest[] = data?.data?.requests || [];

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const name = (r.name ?? '').toLowerCase();
      const email = (r.email ?? '').toLowerCase();
      const phone = (r.phone ?? '').toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchSearch = name.includes(q) || email.includes(q) || phone.includes(q);
      const matchStatus =
        filterStatus === 'all' ||
        r.status === filterStatus ||
        r.moderator?.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [requests, searchQuery, filterStatus]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(
        (r) => r.moderator?.status === 'pending' || r.status === 'pending'
      ).length,
      active: requests.filter(
        (r) => r.moderator?.status === 'active' || r.status === 'active'
      ).length,
      inactive: requests.filter((r) => r.moderator?.status === 'inactive').length,
    }),
    [requests]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOpenAccept = (id: string) => {
    setConfirmModal({ isOpen: true, type: 'accept', userId: id });
  };

  const handleOpenReject = (id: string) => {
    setConfirmModal({ isOpen: true, type: 'reject', userId: id });
  };

  const handleConfirmAction = (studentIds: string[]) => {
    if (!confirmModal.userId || !confirmModal.type) return;
    if (confirmModal.type === 'accept') {
      acceptRequest(
        { userId: confirmModal.userId, studentIds },
        {
          onSuccess: () => {
            setConfirmModal({ isOpen: false, type: null, userId: null });
            setSelectedRequest(null);
          },
        }
      );
    } else {
      rejectRequest(confirmModal.userId, {
        onSuccess: () => {
          setConfirmModal({ isOpen: false, type: null, userId: null });
          setSelectedRequest(null);
        },
      });
    }
  };

  const handleEdit = (request: ModeratorRequest) => {
    setEditRequest(request);
  };

  const handleEditSubmit = async (id: string, data: UpdateModeratorInput) => {
    updateModerator(
      { moderatorId: id, data },
      {
        onSuccess: () => {
          setEditRequest(null);
        },
      }
    );
  };

  const handleDelete = async (request: ModeratorRequest) => {
    const confirmed = await confirm({
      title: language === 'ar' ? 'هل أنت متأكد من حذف هذا المشرف؟' : 'Delete Moderator?',
      message:
        language === 'ar'
          ? 'سيتم حذف المشرف نهائياً ولا يمكن التراجع عن هذا الإجراء.'
          : 'This moderator will be permanently deleted and this action cannot be undone.',
    });
    if (confirmed && request.moderator?.id) {
      deleteModerator(request.moderator.id);
    }
  };

  /** Map a ModeratorRequest to the Moderator shape expected by EditModeratorModal */
  const mapRequestToModerator = (r: ModeratorRequest): Moderator => ({
    id: r.moderator?.id ?? '',
    userId: r.id,
    gender: r.moderator?.gender ?? 'male',
    status: r.moderator?.status ?? 'pending',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      status: r.status,
      code_country: r.code_country,
    },
    studentModerators: r.moderator?.studentModerators ?? [],
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getEffectiveStatus = (r: ModeratorRequest) =>
    r.moderator?.status || r.status || 'pending';

  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'inactive') return 'bg-gray-100 text-gray-600';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusDotClass = (status: string) => {
    if (status === 'active') return 'bg-green-500';
    if (status === 'inactive') return 'bg-gray-400';
    return 'bg-yellow-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return language === 'ar' ? 'نشط' : 'Active';
    if (status === 'inactive') return language === 'ar' ? 'غير نشط' : 'Inactive';
    return language === 'ar' ? 'معلق' : 'Pending';
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  // ── Status Filter Tabs ────────────────────────────────────────────────────────
  const filterTabs: {
    key: typeof filterStatus;
    labelAr: string;
    labelEn: string;
    count: number;
  }[] = [
    { key: 'all', labelAr: 'الكل', labelEn: 'All', count: stats.total },
    { key: 'pending', labelAr: 'معلق', labelEn: 'Pending', count: stats.pending },
    { key: 'active', labelAr: 'نشط', labelEn: 'Active', count: stats.active },
    { key: 'inactive', labelAr: 'غير نشط', labelEn: 'Inactive', count: stats.inactive },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {language === 'ar' ? 'طلبات المشرفين' : 'Moderators Requests'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'ar'
              ? 'مراجعة وقبول أو رفض طلبات التسجيل للمشرفين الجدد'
              : 'Review and accept or reject new moderator registration requests'}
          </p>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 font-medium">
              {language === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-yellow-600 font-medium">
              {language === 'ar' ? 'بانتظار المراجعة' : 'Pending Review'}
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-green-600 font-medium">
              {language === 'ar' ? 'مقبولة' : 'Accepted'}
            </p>
          </div>
        </div>

        <div className="bg-red-50 p-5 rounded-2xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{stats.inactive}</p>
            <p className="text-xs text-red-600 font-medium">
              {language === 'ar' ? 'مرفوضة' : 'Rejected'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            className={`absolute ${
              language === 'ar' ? 'right-4' : 'left-4'
            } top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`}
          />
          <input
            type="text"
            placeholder={
              language === 'ar'
                ? 'بحث بالاسم أو البريد أو الهاتف...'
                : 'Search by name, email or phone...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${
              language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'
            } py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-start`}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl border border-gray-200 flex-shrink-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {language === 'ar' ? tab.labelAr : tab.labelEn}
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  filterStatus === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={7} columns={6} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-sm font-medium text-red-500">
              {language === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load requests'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <Users className="w-12 h-12 text-gray-300" />
            <p className="text-sm font-medium">
              {language === 'ar' ? 'لا توجد طلبات' : 'No requests found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {language === 'ar' ? 'المشرف' : 'Moderator'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {language === 'ar' ? 'المحافظة' : 'Governorate'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {language === 'ar' ? 'تاريخ الطلب' : 'Date'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((request) => {
                  const effectiveStatus = getEffectiveStatus(request);
                  const isPending = effectiveStatus === 'pending';
                  return (
                    <tr key={request.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Moderator info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                            {request.name?.charAt(0) || '?'}
                          </div>
                          <div className="text-start">
                            <p className="font-semibold text-gray-900 text-sm">
                              {request.name || '-'}
                            </p>
                            <p className="text-xs text-gray-400">{request.email || '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-start">
                        <span className="text-sm text-gray-700">
                          {request.code_country ? `${request.code_country} ` : ''}
                          {request.phone || '-'}
                        </span>
                      </td>

                      {/* Governorate */}
                      <td className="px-6 py-4 text-start">
                        <span className="text-sm text-gray-600">
                          {request.additionalData?.governorate || '-'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-start">
                        <span className="text-sm text-gray-600">
                          {formatDate(request.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(effectiveStatus)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(effectiveStatus)}`} />
                          {getStatusLabel(effectiveStatus)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                            title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenAccept(request.moderator.userId)}
                                disabled={isActing}
                                className="p-2 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-colors disabled:opacity-40"
                                title={language === 'ar' ? 'قبول' : 'Accept'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenReject(request.moderator.userId)}
                                disabled={isActing}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                title={language === 'ar' ? 'رفض' : 'Reject'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {!isPending && request.moderator?.id && (
                            <>
                              <button
                                onClick={() => handleEdit(request)}
                                disabled={isUpdating || isDeleting}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                                title={language === 'ar' ? 'تعديل' : 'Edit'}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(request)}
                                disabled={isDeleting || isUpdating}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                title={language === 'ar' ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <ViewModeratorRequestModal
        isOpen={!!selectedRequest}
        request={selectedRequest}
        isActing={isActing}
        onClose={() => setSelectedRequest(null)}
        onAccept={handleOpenAccept}
        onReject={handleOpenReject}
      />

      <ConfirmModeratorRequestModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        isActing={isActing}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal({ isOpen: false, type: null, userId: null })}
      />

      {editRequest && (
        <EditModeratorModal
          isOpen={!!editRequest}
          onClose={() => setEditRequest(null)}
          moderator={mapRequestToModerator(editRequest)}
          onSubmit={handleEditSubmit}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}
