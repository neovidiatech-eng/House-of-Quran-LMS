import { useState, useMemo, useEffect, lazy, useCallback } from 'react';
import { Search, Eye, Pencil, Trash2, Plus, Users, UserCheck, UserX , Copy, Check} from 'lucide-react';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
// import AddTeacherModal from '../../../components/modals/AddTeacherModal';
// import ViewTeacherModal from '../../../components/modals/ViewTeacherModal';
// import EditTeacherModal from '../../../components/modals/EditTeacherModal';
import Pagination from '../../../components/ui/Pagination';
import CustomSelect from '../../../components/ui/CustomSelect';
import { useTranslation } from 'react-i18next';
import { useTeacher, useDeleteTeacher, useCreateTeacher, useUpdateTeacher } from '../hooks/useTeacher';
import { CreateTeacherInput, Teacher } from '../../../types/teachers';
import { TeacherFormData } from '../../../lib/schemas/TeacherSchema';
import { useCurrency } from '../hooks/useCurrency';
import { useConfirm } from '../../../hooks/useConfirm';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';

const AddTeacherModal = lazy(() => import('../../../components/modals/AddTeacherModal'));
const ViewTeacherModal = lazy(() => import('../../../components/modals/ViewTeacherModal'));
const EditTeacherModal = lazy(() => import('../../../components/modals/EditTeacherModal'));


export default function Teachers() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const itemsPerPage = 7;

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTerm.length > 3) {
      setDebouncedSearch(searchTerm);
    } else if (searchTerm.length === 0) {
      setDebouncedSearch('');
    }
  }, [searchTerm]);

  const { data: teachersResponse, isLoading, isError } = useTeacher(debouncedSearch);
  const { data: currenciesData } = useCurrency();
  const deleteTeacherMutation = useDeleteTeacher();
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const { confirm, ConfirmDialog } = useConfirm();

  // Bulletproof data extraction
  const teachers = useMemo(() => {
    return teachersResponse?.teachers || [];
  }, [teachersResponse]);

  // Currency lookup map for the table
  const currencyLookup = useMemo(() => {
    const map: Record<string, string> = {};
    if (currenciesData?.currencies) {
      currenciesData.currencies.forEach(c => {
        map[c.id] = c.symbol || c.code;
      });
    }
    return map;
  }, [currenciesData]);

  const statsCards = useMemo(() => [
    {
      id: 'total',
      label: t('totalTeachers'),
      value: teachers.length,
      icon: Users,
      bgColor: 'bg-primary-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
    {
      id: 'active',
      label: t('active'),
      value: teachers.filter((teacher) => teacher?.active).length,
      icon: UserCheck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    {
      id: 'inactive',
      label: t('inactive'),
      value: teachers.filter((teacher) => teacher && !teacher.active).length,
      icon: UserX,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
    },
  ], [teachers, t]);

  const statuses = [
    { id: 'all', label: 'الحالة', labelEn: 'Status' },
    { id: 'active', label: 'نشط', labelEn: 'Active' },
    { id: 'inactive', label: 'غير نشط', labelEn: 'Inactive' },
  ];
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      if (!teacher) return false;

      const name = teacher.user?.name?.toLowerCase() || '';
      const email = teacher.user?.email?.toLowerCase() || '';
      const phone = teacher.user?.phone || '';
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(search) ||
        email.includes(search) ||
        phone.includes(searchTerm);

      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active' && teacher.active) ||
        (selectedStatus === 'inactive' && !teacher.active);


      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, selectedStatus]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTeachers.length / itemsPerPage)), [filteredTeachers, itemsPerPage]);

  const currentTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  const handleCopyPassword = (userId: string, password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordId(userId);
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const mapFormToApi = (formData: TeacherFormData): CreateTeacherInput => {
    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password || undefined,
      hour_price: Number(formData.hourlyRate),
      currency_id: formData.currency,
      gender: formData.gender as 'male' | 'female',
      active: formData.status === 'active',
      code_country: formData.phone_code,
      subject_ids: formData.subjects,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      meeting_link: formData.meeting_link?.trim() || undefined,
    };
  };

  const handleAddTeacher = async (formData: TeacherFormData) => {
    try {
      const apiData = mapFormToApi(formData);
      await createTeacherMutation.mutateAsync(apiData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding teacher:', error);
      // Detailed error is handled by axios interceptor
      throw error;
    }
  };

  const handleUpdateTeacher = async (formData: TeacherFormData) => {
    if (!selectedTeacher) return;
    try {
      const apiData = mapFormToApi(formData);
      await updateTeacherMutation.mutateAsync({ id: selectedTeacher.id, data: apiData });
      setIsEditModalOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      console.error('Error updating teacher:', error);
      // Detailed error is handled by axios interceptor
      throw error;
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const confirmed = await confirm({
      title: t('deleteTeacher'),
      message: t('deleteConfirmTeacher'),
    });
    if (confirmed) {
      try {
        await deleteTeacherMutation.mutateAsync(teacherId);
      } catch (error) {
        console.error('Error deleting teacher:', error);
        // Detailed error is handled by axios interceptor
      }
    }
  };




  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="text-start">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('teacherManagement')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('teacherManagementSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 btn-primary text-white px-6 py-3 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">
            {t('addNewTeacher')}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="text-start flex-1">
                <p className="text-sm text-gray-600 mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</p>
              </div>
              <div className={`${card.bgColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 !mb-0">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchTeachersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-12' : 'pl-12'} py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start`}
            />
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          </div>

          {/* Status Filter */}
          <CustomSelect
            value={selectedStatus}
            options={statuses.map((c) => {
              return { value: c.id, label: language === 'ar' ? c.label : c.labelEn };
            })}
            onChange={(val) => setSelectedStatus(val as string)}
            className="h-[46px]"
          />
        </div>
      </div>

      {/* Teachers Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('teacherInfo')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('email')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('password')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('phone')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      {t('errorLoadingData')}
                    </td>
                  </tr>
                ) : currentTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('noTeachersFound')}
                    </td>
                  </tr>
                ) : (
                  currentTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 justify-start">
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-start">
                            <div className="text-sm font-bold text-gray-900">{teacher.user?.name || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span className="text-sm text-gray-600">{teacher.user?.email || '-'}</span>
                      </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group">
                          <span className="text-sm text-gray-600">{teacher.user?.password || '-'}</span>
                          {teacher.user?.password && (
                            <button
                              onClick={() => handleCopyPassword(teacher.user?.id, teacher.user?.password)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                              title={t('copy')}
                            >
                              {copiedPasswordId === teacher.user?.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <WhatsAppPhone
                          phone={`${teacher.user?.code_country || ''} ${teacher.user?.phone || ''}`.trim()}
                          className="text-sm text-green-600 hover:text-green-700"
                        />
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span className="text-sm font-medium text-gray-900">
                          {currencyLookup[teacher.currencyId] || teacher.currencyId || '-'} {teacher.hour_price?.toFixed(2) ?? '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${teacher.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                            }`}
                        >
                          {teacher.active ? t('active') : t('inactive')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => handleViewTeacher(teacher)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            title={t('view')}
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="p-2 hover:bg-primary-light rounded-lg transition-colors group"
                            title={t('edit')}
                          >
                            <Pencil className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTeachers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTeacher}
      />

      {/* View Teacher Modal */}
      <ViewTeacherModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTeacher(null);
        }}
        onSubmit={handleUpdateTeacher}
        teacher={selectedTeacher}
      />
      {ConfirmDialog}
    </div>
  );
}
