// import AddExamModal from '../../../components/modals/ExamModal';
// import { useConfirm } from '../../../hooks/useConfirm';
import { useState, useMemo } from "react";

import { Search, Filter } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

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
  const [showFilters, setShowFilters] = useState(false);


  const [filters, setFilters] = useState({
    status: "",
    subject: "",
    teacher: "",
    student: "",
  });

  const { data: apiResponse, isLoading, isError } = useExams();

  const exams = useMemo(() => {
    const rawItems = apiResponse?.data?.items ?? [];
    return rawItems.map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject?.name_en || exam.subject?.name_ar || "",
      teacher: exam.teacher?.user?.name || "",
      studentName: exam.student?.user?.name || "",
      dueDate: exam.dueDate,
      duration: `${exam.duration} min`,
      grade: exam.grade ?? 0,
      status: (exam.status === "pending" ? "upcoming" : "completed") as "upcoming" | "completed",
    })) as Exam[];
  }, [apiResponse]);



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
    columnStudent: { ar: "الطالب", en: "Student" },
    columnDueDate: { ar: "تاريخ", en: "Due Date" },
    columnDuration: { ar: "المدة (دقيقة)", en: "Duration (min)" },
    columnGrade: { ar: "الدرجة", en: "Grade" },
    columnStatus: { ar: "الحالة", en: "Status" },
    upcoming: { ar: "قادم", en: "Upcoming" },
    completed: { ar: "مكتمل", en: "Completed" },
  };

  const currentExams = useMemo(() => {
    return exams.filter((exam: Exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.studentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filters.status || exam.status === filters.status;
      const matchesSubject = !filters.subject || exam.subject === filters.subject;
      const matchesTeacher = !filters.teacher || exam.teacher === filters.teacher;
      const matchesStudent = !filters.student || exam.studentName === filters.student;

      return matchesSearch && matchesStatus && matchesSubject && matchesTeacher && matchesStudent;
    });
  }, [exams, searchTerm, filters]);


  // ✅ Loading / Error states
  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">Error loading exams</div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {text.title[language]}
        </h1>
        {/* <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {text.addExam[language]}
        </button> */}
      </div>

      {/* <AddExamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleSaveExam}
        initialData={editingExam}
      /> */}

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
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
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
              <input
                type="text"
                placeholder={text.columnStudent[language]}
                value={filters.student}
                onChange={(e) =>
                  setFilters({ ...filters, student: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
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
                {/* <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnActions[language]}</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentExams.map((exam: Exam) => (
                <tr
                  key={exam.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-start text-gray-900 font-medium">
                    {exam.studentName}
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
                    {new Date(exam.dueDate).toISOString().split("T")[0]}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-600">
                    {exam.duration}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900 font-medium">
                    {exam.grade}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${exam.status === "upcoming"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                        }`}
                    >
                      {text[exam.status][language]}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2 justify-start">
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="p-2 icon-btn-primary rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        </div>
      </div>

  );
}
