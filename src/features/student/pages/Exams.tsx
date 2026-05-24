import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import { useExams } from "../hooks/useExams";

interface Exam {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  studentName: string;
  dueDate: string;
  duration: string;
  grade: number;
  status: "upcoming" | "completed";
}

export default function Exams() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    subject: "",
    teacher: "",
    student: "",
  });
  const itemsPerPage = 10;

  const { data, isLoading, isError } = useExams();
  const text = {
    title: { ar: "الامتحانات", en: "Exams" },
    search: {
      ar: "بحث بالعنوان أو المعلم أو الطالب...",
      en: "Search by title, teacher or student...",
    },
    filters: { ar: "الفلاتر الشائعة", en: "Common filters" },
    columnTitle: { ar: "العنوان", en: "Title" },
    columnSubject: { ar: "المادة", en: "Subject" },
    columnTeacher: { ar: "المعلم", en: "Teacher" },
    columnDueDate: { ar: "تاريخ", en: "Due Date" },
    columnDuration: { ar: "المدة (دقيقة)", en: "Duration (min)" },
    columnGrade: { ar: "الدرجة", en: "Grade" },
    columnStatus: { ar: "الحالة", en: "Status" },
    upcoming: { ar: "قادم", en: "Upcoming" },
    completed: { ar: "مكتمل", en: "Completed" },
    minutes: { ar: "دقيقة", en: "minutes" },
  };

  // const filteredExams = exams.filter((exam) => {
  //   const matchesSearch =
  //     exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     exam.teacher.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesStatus = !filters.status || exam.status === filters.status;
  //   const matchesSubject = !filters.subject || exam.subject === filters.subject;
  //   const matchesTeacher = !filters.teacher || exam.teacher === filters.teacher;

  //   return matchesSearch && matchesStatus && matchesSubject && matchesTeacher;
  // });
  const exams: Exam[] =
    data?.data?.map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject?.name_en || exam.subject?.name_ar || "",
      teacher: exam.teacher?.user?.name || "",
      studentName: exam.student?.user?.name || "",
      dueDate: exam.dueDate
        ? new Date(exam.dueDate).toISOString().split("T")[0]
        : "",
      duration: `${exam.duration} دقيقة`,
      grade: exam.grade,
      status: exam.status === "pending" ? "upcoming" : "completed",
    })) || [];
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.teacher.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || exam.status === filters.status;

    const matchesSubject = !filters.subject || exam.subject === filters.subject;

    const matchesTeacher = !filters.teacher || exam.teacher === filters.teacher;

    return matchesSearch && matchesStatus && matchesSubject && matchesTeacher;
  });
  const totalPages = Math.ceil((filteredExams?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = (filteredExams || []).slice(startIndex, endIndex);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {text.title[language]}
        </h1>
      </div>

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
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              >
                <option value="">{text.columnStatus[language]}</option>
                <option value="upcoming">{text.upcoming[language]}</option>
                <option value="completed">{text.completed[language]}</option>
              </select>
              <input
                type="text"
                placeholder={text.columnSubject[language]}
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
              <input
                type="text"
                placeholder={text.columnTeacher[language]}
                value={filters.teacher}
                onChange={(e) =>
                  setFilters({ ...filters, teacher: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnTitle[language]}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnSubject[language]}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnTeacher[language]}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnDueDate[language]}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnDuration[language]}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnGrade[language]}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {text.columnStatus[language]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentExams.map((exam) => (
                <tr
                  key={exam.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-start text-gray-900 font-medium">
                    {exam.title}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className="text-primary font-medium hover:underline cursor-pointer">
                      {exam.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900">
                    {exam.teacher}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-600">
                    {exam.dueDate}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-600">
                    {exam.duration}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900 font-medium">
                    {exam.grade}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        exam.status === "upcoming"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {text[exam.status][language]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredExams.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
