import { useState, lazy, useMemo, useEffect } from 'react';
import { Search, Eye, Pencil, Trash2, Plus, Users, UserCheck, UserX, ClipboardList, Check, Copy } from 'lucide-react';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
// import AddStudentModal from '../../../components/modals/AddStudentModal';
// import ViewStudentModal from '../../../components/modals/ViewStudentModal';
// import EditStudentModal from '../../../components/modals/EditStudentModal';
import Pagination from '../../../components/ui/Pagination';
import CustomSelect from '../../../components/ui/CustomSelect';
import { useTranslation } from 'react-i18next';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../hooks/useStudents';
import { Student } from '../../../types/student';
import { useConfirm } from '../../../hooks/useConfirm';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';

const AddStudentModal = lazy(() => import('../../../components/modals/AddStudentModal'));
const ViewStudentModal = lazy(() => import('../../../components/modals/ViewStudentModal'));
const EditStudentModal = lazy(() => import('../../../components/modals/EditStudentModal'));



export default function Students() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const itemsPerPage = 7;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const studentsQueryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    country: selectedCountry !== 'all' ? selectedCountry : undefined,
    planId: selectedGrade !== 'all' ? selectedGrade : undefined,
  }), [currentPage, itemsPerPage, debouncedSearch, selectedCountry, selectedGrade]);

  const { data: apiResponse, isLoading } = useStudents(studentsQueryParams);

  const rawData: any = apiResponse?.data.studentsData;
  const studentsList: Student[] = Array.isArray(rawData) ? rawData : (rawData?.students || rawData?.data || []);
  const pagination = apiResponse?.data?.pagination;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const { mutateAsync: createStudent } = useCreateStudent();
  const { mutateAsync: updateStudent } = useUpdateStudent();
  const { mutateAsync: deleteStudent } = useDeleteStudent();
  const { confirm, ConfirmDialog } = useConfirm();

  const stats = useMemo(() => [
    {
      id: 'total',
      label: t('totalStudents'),
      value: totalItems,
      icon: Users,
      bgColor: 'bg-primary-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
    {
      id: 'active',
      label: t('activeStudents'),
      value: studentsList.filter(student => student.status === 'approved').length,
      icon: UserCheck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    {
      id: 'pending',
      label: t('pendingStudents'),
      value: studentsList.filter(student => student.status === 'pending').length,
      icon: UserX,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
    },
    {
      id: 'plans',
      label: t('numberOfPlans'),
      value: 3,
      icon: ClipboardList,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600',
    },
  ], [studentsList, t]);


  const grades = [
    { id: 'all', label: t('allPlans'), labelEn: 'All Plans' },
    { id: 'secondary_1', label: t('secondary1'), labelEn: 'Secondary 1' },
    { id: 'secondary_2', label: t('secondary2'), labelEn: 'Secondary 2' },
  ];

  const countries = [
    { id: 'all', label: t('selectCountry'), labelEn: 'Select Country' },
    { id: 'egypt', label: t('egypt'), labelEn: 'Egypt' },
    { id: 'saudi', label: t('saudiArabia'), labelEn: 'Saudi Arabia' },
  ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedGrade, selectedCountry]);


 const handleCopyPassword = (userId: string, password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordId(userId);
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    const confirmed = await confirm({
      title: t('deleteStudent'),
      message: t('deleteConfirmStudent'),
    });
    if (confirmed) {
      try {
        await deleteStudent(studentId);
      } catch (error) {
        console.error('Error deleting student:', error);
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
            {t('studentManagement')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('manageStudentsDescription')}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 btn-primary text-white px-6 py-3 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">
            {t('addNewStudent')}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="text-start">
              <p className={`text-4xl font-bold ${stat.valueColor} mb-2`}>{stat.value}</p>
              <p className="text-sm font-medium text-gray-700">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searchUsersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start`}
            />
          </div>

          {/* Country Filter */}
          <div>
            <CustomSelect
              value={selectedCountry}
              options={countries.map((country) => ({
                value: country.id,
                label: language === 'ar' ? country.label : country.labelEn,
                searchText: `${country.label} ${country.labelEn}`,
              }))}
              onChange={(val) => setSelectedCountry(val as string)}
              className="h-[46px]"
            />
          </div>

          {/* Grade Filter */}
          <div>
            <CustomSelect
              value={selectedGrade}
              options={grades.map((grade) => ({
                value: grade.id,
                label: language === 'ar' ? grade.label : grade.labelEn,
                searchText: `${grade.label} ${grade.labelEn}`,
              }))}
              onChange={(val) => setSelectedGrade(val as string)}
              className="h-[46px]"
            />
          </div>
        </div>
      </div>

      {/* Students Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('studentInfo')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('password')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('phone')}
                  </th>

                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('plan')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('hours')}
                  </th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                    {t('country')}
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
                {studentsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-gray-200" />
                        <p>{t('noData')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  studentsList.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-sm font-semibold">
                              {student.user.name ? student.user.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <div className="text-start">
                            <div className="font-medium text-gray-900">{student.user.name}</div>
                            <div className="text-xs text-gray-500">{student.user.email}</div>
                          </div>
                        </div>
                      </td>
                         <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group">
                          <span className="text-sm text-gray-600">{student.user?.password || '-'}</span>
                          {student.user?.password && (
                            <button
                              onClick={() => handleCopyPassword(student.user?.id, student.user?.password)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                              title={t('copy')}
                            >
                              {copiedPasswordId === student.user?.id ? (
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
                          phone={`${student.user.code_country} ${student.user.phone}`}
                          className="text-sm text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span className="inline-flex px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                          {student.plan?.name_ar || student.plan?.name_en || t('noPlan')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <div className="text-start">
                          <div className="text-sm font-medium text-gray-900">
                            {student.sessions_attended} / {student.sessions}
                          </div>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all duration-500"
                              style={{ width: `${student.sessions > 0 ? (student.sessions_attended / student.sessions) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span className="text-sm text-gray-600">{student.country}</span>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${student.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : student.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'} ${student.status === 'approved' ? 'bg-green-500' : student.status === 'pending' ? 'bg-orange-500' : 'bg-gray-500'
                            }`} />
                          {student.status === 'approved' ? t('active') : student.status === 'pending' ? t('pending') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            title={t('view')}
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-2 hover:bg-primary-light rounded-lg transition-colors group"
                            title={t('edit')}
                          >
                            <Pencil className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
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
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (studentData) => {
          try {
            const payload: any = {
              name: studentData.name,
              email: studentData.email,
              phone: studentData.phone,
              phone_code: studentData.phone_code,
              birth_date: (studentData.birthDate && studentData.birthDate !== "") ? new Date(studentData.birthDate).toISOString() : null,
              gender: studentData.gender,
              country: studentData.country,
              active: studentData.status === 'approved',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };

            if (studentData.plan && studentData.plan.trim() !== "") {
              payload.planId = studentData.plan;
            }

            if (studentData.password) {
              payload.password = studentData.password;
            }
            await createStudent(payload);
            setIsAddModalOpen(false);
            setSelectedStudent(null);
          } catch (error) {
            console.error('Error adding student:', error);
            // Detailed error is handled by axios interceptor
            throw error;
          }
        }}
      />

      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        studentData={selectedStudent}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        studentData={
          selectedStudent
            ? {
              id: selectedStudent.id,
              name: selectedStudent.user.name,
              email: selectedStudent.user.email,
              phone: selectedStudent.user.phone,
              phone_code: selectedStudent.user.code_country,
              country: selectedStudent.country ? selectedStudent.country.toLowerCase() : 'egypt',
              status: (selectedStudent.status || 'pending') as any,
              gender: selectedStudent.gender || 'male',
              plan: selectedStudent.planId || '',
              password: '',
              birthDate: selectedStudent.birth_date ? selectedStudent.birth_date.split('T')[0] : '',
            }
            : null
        }
        onSubmit={async (updatedData) => {
          try {
            const payload: any = {
              name: updatedData.name,
              // Backend expects separate phone and phone_code
              phone: updatedData.phone,
              phone_code: updatedData.phone_code,
              country: updatedData.country,
              birth_date: (updatedData.birthDate && updatedData.birthDate !== "") ? new Date(updatedData.birthDate).toISOString() : null,
              gender: updatedData.gender,
              active: updatedData.status === 'approved',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };

            if (updatedData.plan && updatedData.plan.trim() !== "") {
              payload.planId = updatedData.plan;
            } else {
              payload.planId = null;
            }

            if (updatedData.password) {
              payload.password = updatedData.password;
            }
            await updateStudent({ id: updatedData.id, data: payload });
            setIsEditModalOpen(false);
            setSelectedStudent(null);
          } catch (error) {
            console.error('Error updating student:', error);
            // Detailed error is handled by axios interceptor
            throw error;
          }
        }}
      />
      {ConfirmDialog}
    </div>
  );
}
