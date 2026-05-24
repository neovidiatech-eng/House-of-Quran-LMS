import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Pagination from '../../../components/ui/Pagination';
import { useHomework } from '../hooks/usehomwork';
import { Homework } from '../../../types/assignment';

export default function Assignments() {
  const { language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    subject: '',
    teacher: '',
    student: '',
  });

  const itemsPerPage = 10;

  const { data: assignmentsData, isLoading } = useHomework();

  const text = {
    title: { ar: 'الواجبات', en: 'Assignments' },
    search: {
      ar: 'بحث بالطالب أو العنوان...',
      en: 'Search by student or title...',
    },
    filters: { ar: 'الفلاتر الشائعة', en: 'Common filters' },

    columnStudent: { ar: 'الطالب', en: 'Student' },
    columnSubject: { ar: 'المادة', en: 'Subject' },
    columnTeacher: { ar: 'المعلم', en: 'Teacher' },
    columnTitle: { ar: 'العنوان', en: 'Title' },
    columnDescription: { ar: 'الوصف', en: 'Description' },
    columnDueDate: { ar: 'تاريخ التسليم', en: 'Due Date' },
    columnStatus: { ar: 'الحالة', en: 'Status' },

    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    submitted: { ar: 'تم التسليم', en: 'Submitted' },
    graded: { ar: 'تم التصحيح', en: 'Graded' },

    empty: {
      ar: 'لا توجد واجبات',
      en: 'No assignments found',
    },
  };

  const assignments = assignmentsData?.data?.items || [];

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment: Homework) => {
      const lowerSearch = searchTerm.toLowerCase();

      const matchesSearch =
        assignment.student?.user?.name
          ?.toLowerCase()
          ?.includes(lowerSearch) ||
        assignment.title?.toLowerCase()?.includes(lowerSearch) ||
        assignment.subject?.name_en
          ?.toLowerCase()
          ?.includes(lowerSearch) ||
        assignment.teacher?.user?.name
          ?.toLowerCase()
          ?.includes(lowerSearch) ||
        assignment.description?.toLowerCase()?.includes(lowerSearch);

      const matchesStatus =
        !filters.status || assignment.status === filters.status;

      const matchesSubject =
        !filters.subject ||
        assignment.subject?.name_en
          ?.toLowerCase()
          ?.includes(filters.subject.toLowerCase());

      const matchesTeacher =
        !filters.teacher ||
        assignment.teacher?.user?.name
          ?.toLowerCase()
          ?.includes(filters.teacher.toLowerCase());

      const matchesStudent =
        !filters.student ||
        assignment.student?.user?.name
          ?.toLowerCase()
          ?.includes(filters.student.toLowerCase());

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubject &&
        matchesTeacher &&
        matchesStudent
      );
    });
  }, [assignments, searchTerm, filters]);

  const pagination = assignmentsData?.data?.pagination;

  const totalPages = pagination?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {text.title[language]}
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                type="text"
                placeholder={text.search[language]}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {text.filters[language]}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
              {/* Status */}
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value,
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
              >
                <option value="">
                  {text.columnStatus[language]}
                </option>

                <option value="pending">
                  {text.pending[language]}
                </option>

                <option value="submitted">
                  {text.submitted[language]}
                </option>

                <option value="graded">
                  {text.graded[language]}
                </option>
              </select>

              {/* Subject */}
              <input
                type="text"
                placeholder={text.columnSubject[language]}
                value={filters.subject}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    subject: e.target.value,
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />

              {/* Teacher */}
              <input
                type="text"
                placeholder={text.columnTeacher[language]}
                value={filters.teacher}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    teacher: e.target.value,
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />

              {/* Student */}
              <input
                type="text"
                placeholder={text.columnStudent[language]}
                value={filters.student}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    student: e.target.value,
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table
            className="w-full"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnStudent[language]}
                </th>

                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnTeacher[language]}
                </th>

                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnSubject[language]}
                </th>

                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnTitle[language]}
                </th>

                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnDescription[language]}
                </th>

                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnDueDate[language]}
                </th>

                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnStatus[language]}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment: Homework) => (
                  <tr
                    key={assignment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Student */}
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">
                      {assignment.student?.user?.name || '-'}
                    </td>

                    {/* Teacher */}
                    <td className="px-6 py-4 text-start text-gray-900">
                      {assignment.teacher?.user?.name || '-'}
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 text-start">
                      <span className="text-primary font-medium">
                        {language === 'ar'
                          ? assignment.subject?.name_ar
                          : assignment.subject?.name_en}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">
                      {assignment.title}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-start text-gray-600 max-w-[250px] truncate">
                      {assignment.description}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 text-start text-gray-600">
                      {new Date(
                        assignment.dueDate
                      ).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-start">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          assignment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : assignment.status === 'submitted'
                            ? 'bg-primary-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {
                          text[
                            assignment.status as
                              | 'pending'
                              | 'submitted'
                              | 'graded'
                          ][language]
                        }
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-gray-400 font-medium"
                  >
                    {text.empty[language]}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pagination?.totalItems || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}