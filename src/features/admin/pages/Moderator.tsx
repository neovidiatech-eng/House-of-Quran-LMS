import { useState, useMemo, useEffect } from 'react';
import { Search, Eye , Plus, UserCheck, Users, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
import Pagination from '../../../components/ui/Pagination';
import CustomSelect from '../../../components/ui/CustomSelect';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useConfirm } from '../../../hooks/useConfirm';
import {
  useAllModerators,
  useCreateModerator,
  useUpdateModerator,
  useDeleteModerator,
} from '../hooks/useModerator';
import { Moderator, CreateModeratorInput, UpdateModeratorInput, ModeratorOrderBy, SortOrder } from '../../../types/moderator';
import AddModeratorModal from '../../../components/modals/AddModeratorModal';
import EditModeratorModal from '../../../components/modals/EditModeratorModal';
import ViewModeratorModal from '../../../components/modals/ViewModeratorModal';

export default function ModeratorPage() {
  const { t, i18n } = useTranslation();
  const language = i18n?.language?.split('-')[0] || 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [orderFilter, setOrderFilter] = useState<SortOrder>('desc');
  const [orderBy, setOrderBy] = useState<ModeratorOrderBy>('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, genderFilter, orderBy, orderFilter]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null);

  // API hooks
  const { data: moderatorsResponse, isLoading, isError } = useAllModerators({
    page: 1,
    limit: 100,
    search: debouncedSearch || undefined,
    order: orderFilter,
    orderBy: orderBy,
  });

  const createModeratorMutation = useCreateModerator();
  const updateModeratorMutation = useUpdateModerator();
  const deleteModeratorMutation = useDeleteModerator();
  const { confirm, ConfirmDialog } = useConfirm();

  const allModerators: Moderator[] = moderatorsResponse?.data?.items || [];

  // Filter and sort moderators
  const filteredModerators = useMemo(() => {
    let list = [...allModerators];

    // Filter by gender
    if (genderFilter !== 'all') {
      list = list.filter((mod) => mod.gender === genderFilter);
    }

    // Sort according to orderBy and orderFilter
    list.sort((a, b) => {
      if (orderBy === 'createdAt') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return orderFilter === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (orderBy === 'active') {
        const statusA = (a.status === 'active' || a.user?.status === 'active') ? 1 : 0;
        const statusB = (b.status === 'active' || b.user?.status === 'active') ? 1 : 0;
        return orderFilter === 'asc' ? statusA - statusB : statusB - statusA;
      }
      return 0;
    });

    return list;
  }, [allModerators, genderFilter, orderBy, orderFilter]);

  // Statistics
  const totalCount = allModerators.length;
  const activeCount = allModerators.filter((m) => m.user.status === 'active').length;
  const totalAssignedStudents = allModerators.reduce(
    (acc, curr) => acc + (curr.studentModerators?.length || 0),
    0
  );

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredModerators.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentModerators = filteredModerators.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Handlers
  const handleAddModerator = async (data: CreateModeratorInput) => {
    await createModeratorMutation.mutateAsync(data);
    setIsAddModalOpen(false);
  };

  const handleEditModerator = async (id: string, data: UpdateModeratorInput) => {
    await updateModeratorMutation.mutateAsync({ id, data });
    setIsEditModalOpen(false);
    setSelectedModerator(null);
  };

  const handleDeleteModerator = async (id: string) => {
    const confirmed = await confirm({
      title: t('deleteConfirmModerator') || 'هل أنت متأكد من حذف هذا المشرف؟',
      message: t('deleteConfirmModerator') || 'سيتم إزالة المشرف وإلغاء إسناد الطلاب المرتبطين به.',
    });
    if (confirmed) {
      deleteModeratorMutation.mutate(id);
    }
  };

  const handleView = (moderator: Moderator) => {
    setSelectedModerator(moderator);
    setIsViewModalOpen(true);
  };

  const handleEdit = (moderator: Moderator) => {
    setSelectedModerator(moderator);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <span>{t('sidebar_dashboard') || t('home') || 'الرئيسية'}</span>
        <span>/</span>
        <span>{t('sidebar_user_management') || 'إدارة المستخدمين'}</span>
        <span>/</span>
        <span className="text-primary font-semibold">{t('sidebar_moderators') || t('moderators') || 'المشرفين'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t('moderatorManagement') || 'إدارة المشرفين'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('moderatorManagementSubtitle') || 'متابعة وإدارة بيانات المشرفين والطلاب المسندين إليهم'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 font-medium text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addNewModerator') || 'إضافة مشرف جديد'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-xs text-gray-500 font-medium">{t('totalModerators') || 'إجمالي المشرفين'}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <div className="text-xs text-gray-500 font-medium">{t('activeModerators') || 'المشرفين النشطين'}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalAssignedStudents}</div>
            <div className="text-xs text-gray-500 font-medium">{t('assignedStudents') || 'الطلاب المسندين'}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="relative w-full xl:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('search') || 'بحث بالاسم، البريد أو الهاتف...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-start"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        
          {/* Order Direction Filter */}
          <div className="w-full sm:w-40">
            <CustomSelect
              value={orderFilter}
              options={[
                {
                  value: 'desc',
                  label: language === 'ar' ? 'تنازلي (الأحدث)' : 'Descending',
                  searchText: 'تنازلي الأحدث Descending Newest'
                },
                {
                  value: 'asc',
                  label: language === 'ar' ? 'تصاعدي (الأقدم)' : 'Ascending',
                  searchText: 'تصاعدي الأقدم Ascending Oldest'
                },
              ]}
              onChange={(val) => {
                setOrderFilter(val as SortOrder);
              }}
              className="h-[42px]"
            />
          </div>
            {/* Order By Filter */}
          <div className="w-full sm:w-44">
            <CustomSelect
              value={orderBy}
              options={[
                {
                  value: 'createdAt',
                  label: language === 'ar' ? 'تاريخ الإنشاء' : 'Creation Date',
                  searchText: 'تاريخ الإنشاء Creation Date'
                },
                {
                  value: 'active',
                  label: language === 'ar' ? 'الحالة (النشاط)' : 'Status (Active)',
                  searchText: 'الحالة النشاط Status Active'
                },
              ]}
              onChange={(val) => {
                setOrderBy(val as ModeratorOrderBy);
              }}
              className="h-[42px]"
            />
          </div>


          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => {
                setGenderFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {t('all') || 'الكل'}
            </button>
            <button
              onClick={() => {
                setGenderFilter('male');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === 'male'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {t('male') || 'ذكور'}
            </button>
            <button
              onClick={() => {
                setGenderFilter('female');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === 'female'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {t('female') || 'إناث'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('name')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('phone')}
                  </th>
                   <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('password')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('gender')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('assignedStudents') || 'الطلاب المسندين'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500 font-medium">
                      {t('errorLoadingData') || 'حدث خطأ أثناء تحميل البيانات'}
                    </td>
                  </tr>
                ) : currentModerators.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium">{t('noData') || 'لا توجد بيانات متاحة'}</p>
                    </td>
                  </tr>
                ) : (
                  currentModerators.map((moderator) => {
                    const studentCount = moderator.studentModerators?.length || 0;
                    const isActive = moderator.status === 'active' || moderator.user?.status === 'active';

                    return (
                      <tr key={moderator.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Name & Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {moderator.user?.name?.charAt(0).toUpperCase() || 'M'}
                            </div>
                            <div className="text-start">
                              <div className="font-semibold text-gray-900 text-sm">{moderator.user?.name || '-'}</div>
                              <div className="text-xs text-gray-400">{moderator.user?.email || '-'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4">
                          <WhatsAppPhone
                            phone={`${moderator.user?.code_country || ''} ${moderator.user?.phone || ''}`}
                            className="text-gray-900 text-sm"
                          />
                        </td>

                         <td className="px-6 py-4">
                         <span className="text-gray-900 text-sm">
                          {moderator.user?.password}
                         </span>
                        </td>

                        {/* Gender */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                              moderator.gender === 'male'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-pink-50 text-pink-700'
                            }`}
                          >
                            {moderator.gender === 'male' ? (t('male') || 'ذكر') : (t('female') || 'أنثى')}
                          </span>
                        </td>

                        {/* Assigned Students */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleView(moderator)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                            title={t('viewModerator') || 'عرض الطلاب'}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{studentCount} {t('students') || 'طلاب'}</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isActive ? (t('active') || 'نشط') : (t('inactive') || 'غير نشط')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleView(moderator)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                              title={t('view') || 'عرض'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(moderator)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                              title={t('edit') || 'تعديل'}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteModerator(moderator.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                              title={t('delete') || 'حذف'}
                              disabled={deleteModeratorMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* Pagination */}
        {!isLoading && filteredModerators.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredModerators.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      <AddModeratorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddModerator}
      />

      {selectedModerator && (
        <EditModeratorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedModerator(null);
          }}
          moderator={selectedModerator}
          onSubmit={handleEditModerator}
        />
      )}

      {selectedModerator && (
        <ViewModeratorModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedModerator(null);
          }}
          moderator={selectedModerator}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}
