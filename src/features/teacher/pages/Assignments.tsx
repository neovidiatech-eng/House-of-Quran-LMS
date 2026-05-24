import { useState } from 'react';
import { Search, Trash2, Filter , Plus } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Pagination from '../../../components/ui/Pagination';
import AddAssignmentModal from '../../../components/modals/AddAssignmentModal';
import { useConfirm } from '../../../hooks/useConfirm';
import { useGetAssignments, useDeleteAssignment } from '../../../hooks/useAssignment';
import { Assignment } from '../../../types/assignment';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';

export default function Assignments() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();
  const deleteMutation = useDeleteAssignment();

  const [filters, setFilters] = useState({
    status: '',
    subject: '',
    teacher: '',
    student: ''
  });
  const itemsPerPage = 10;

  const { data: assignmentsData, isLoading } = useGetAssignments();
  const assignments = assignmentsData?.data?.items || [];



  const text = {
    title: { ar: 'الواجبات', en: 'Assignments' },
    search: { ar: 'بحث بالطالب أو العنوان...', en: 'Search by student or title...' },
    addAssignment: { ar: 'إضافة واجب', en: 'Add Assignment' },
    filters: { ar: 'الفلاتر الشائعة', en: 'Common filters' },
    columnStudent: { ar: 'الطالب', en: 'Student' },
    columnSubject: { ar: 'المادة', en: 'Subject' },
    columnTeacher: { ar: 'المعلم', en: 'Teacher' },
    columnTitle: { ar: 'العنوان', en: 'Title' },
    columnDescription: { ar: 'الوصف', en: 'Description' },
    columnDueDate: { ar: 'تاريخ التسليم', en: 'Due Date' },
    columnStatus: { ar: 'الحالة', en: 'Status' },
    columnActions: { ar: 'الإجراءات', en: 'Actions' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    submitted: { ar: 'تم التسليم', en: 'Submitted' },
    graded: { ar: 'تم التصحيح', en: 'Graded' },
    showing: { ar: 'الصفحة', en: 'Page' },
    of: { ar: 'من', en: 'of' },
    total: { ar: 'الإجمالي', en: 'Total' },
    previous: { ar: 'السابق', en: 'Previous' },
    next: { ar: 'التالي', en: 'Next' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...' }
  };

  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    const studentName = assignment.student?.user?.name || '';
    const subjectName = language === 'ar' ? assignment.subject?.name_ar : assignment.subject?.name_en || assignment.subject?.name_ar;

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || assignment.status === filters.status;
    const matchesSubject = !filters.subject || (subjectName || '').toLowerCase().includes(filters.subject.toLowerCase());
    const matchesStudent = !filters.student || studentName.toLowerCase().includes(filters.student.toLowerCase());

    return matchesSearch && matchesStatus && matchesSubject && matchesStudent;
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setShowAddModal(true);
    setEditingAssignment(assignment);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    const confirmed = await confirm({
      title: language === 'ar' ? 'حذف واجب' : 'Delete Assignment',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذا الواجب؟' : 'Are you sure you want to delete this assignment?',
    });
    if (confirmed) {
      deleteMutation.mutate(assignmentId);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAssignment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{text.title[language]}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {text.addAssignment[language]}
        </button>
      </div>

      <AddAssignmentModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        initialData={editingAssignment}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={text.search[language]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                dir="rtl"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {text.filters[language]}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              >
                <option value="">{text.columnStatus[language]}</option>
                <option value="pending">{text.pending[language]}</option>
                <option value="submitted">{text.submitted[language]}</option>
                <option value="graded">{text.graded[language]}</option>
              </select>
              <input
                type="text"
                placeholder={text.columnSubject[language]}
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
              <input
                type="text"
                placeholder={text.columnStudent[language]}
                value={filters.student}
                onChange={(e) => setFilters({ ...filters, student: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <TableSkeleton rows={itemsPerPage} columns={8} />
          ) : currentAssignments.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 font-medium flex-col gap-2">
              <Search className="w-12 h-12 text-gray-300" />
              <span>{language === 'ar' ? 'لا توجد واجبات تطابق بحثك' : 'No assignments match your search'}</span>
            </div>
          ) : (
            <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnStudent[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnSubject[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnTeacher[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnTitle[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnDescription[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnDueDate[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnStatus[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnActions[language]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentAssignments.map((assignment: Assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">{assignment.student?.user?.name}</td>
                    <td className="px-6 py-4 text-start">
                      <span className="text-primary font-medium hover:underline cursor-pointer">
                        {language === 'ar' ? assignment.subject?.name_ar : assignment.subject?.name_en || assignment.subject?.name_ar}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">{assignment.teacher?.user?.name}</td>
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">{assignment.title}</td>
                    <td className="px-6 py-4 text-start text-gray-600">{assignment.description}</td>
                    <td className="px-6 py-4 text-start text-gray-600">
                      {new Date(assignment.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 text-start">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${assignment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : assignment.status === 'submitted'
                          ? 'bg-primary-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {text[assignment.status as keyof typeof text] ? (text[assignment.status as keyof typeof text] as any)[language] : assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-start">
                      <div className="flex items-center gap-2 justify-start">
                       
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAssignments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {ConfirmDialog}
    </div>
  );
}
