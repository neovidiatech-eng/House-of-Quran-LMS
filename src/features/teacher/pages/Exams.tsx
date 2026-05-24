import { useState } from "react";
import { Search, Trash2, Filter, Plus, Eye } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import { useConfirm } from "../../../hooks/useConfirm";
import AddExamModal from "../../../components/modals/ExamModal";
import {
  useCreateExam,
  useDeleteExam,
  useExamDetails,
  useExams,
} from "../hooks/useExams";
import ViewExamModal from "../../../components/modals/ViewExamModal";
import { ExamFormData } from "../../../lib/schemas/ExamSchema";

interface Exam {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  studentName: string;
  studentId?: string;
  subjectId?: string;
  dueDate: string;
  duration: number;
  grade: number;
  totalMarks?: number;
  status: "upcoming" | "completed";
}

export default function Exams() {
  const { language } = useLanguage();
  const createExam = useCreateExam();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamFormData | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const deleteExamMutation = useDeleteExam();

  const { data: examDetails } = useExamDetails(
    selectedExamId || "",
    !!selectedExamId && showModal,
  );

  const { confirm, ConfirmDialog } = useConfirm();

  const [filters, setFilters] = useState({
    status: "",
    subject: "",
    student: "",
  });

  const itemsPerPage = 10;

  // API
  const { data, isLoading, isError } = useExams();

  // Mapping
  const exams: Exam[] =
    data?.data?.map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject?.name_en || exam.subject?.name_ar || "",
      teacher: exam.teacher?.user?.name || "",
      studentName: exam.student?.user?.name || "",
      studentId: exam.studentId,
      subjectId: exam.subjectId,
      dueDate: exam.dueDate
        ? new Date(exam.dueDate).toISOString().split("T")[0]
        : "",
        totalMarks: exam.totalMarks,
      duration: exam.duration,
      grade: exam.grade,
      status: exam.status === "pending" ? "upcoming" : "completed",
    })) || [];
  const text = {
    title: { ar: "الامتحانات", en: "Exams" },
    search: { ar: "بحث...", en: "Search..." },
    addExam: { ar: "إضافة امتحان", en: "Add Exam" },
    upcoming: { ar: "قادم", en: "Upcoming" },
    completed: { ar: "مكتمل", en: "Completed" },
    filters: { ar: "فلتر", en: "Filters" },
    columnTitle: { ar: "العنوان", en: "Title" },
    columnSubject: { ar: "المادة", en: "Subject" },
    columnStudent: { ar: "الطالب", en: "Student" },
    columnDueDate: { ar: "التاريخ", en: "Due" },
    columnDuration: { ar: "المدة", en: "Duration" },
    columnTotalMarks: { ar: "الدرجة الكاملة", en: "Total Marks" },
    columnGrade: { ar: "درجة الطالب", en: "Student Grade" },
    columnStatus: { ar: "الحالة", en: "Status" },
    columnActions: { ar: "الإجراءات", en: "Actions" },
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingExam(null);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || exam.status === filters.status;
    const matchesSubject = !filters.subject || exam.subject === filters.subject;
    const matchesStudent =
      !filters.student || exam.studentName === filters.student;

    return matchesSearch && matchesStatus && matchesSubject && matchesStudent;
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

  const currentExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // CREATE
  const handleSaveExam = async (examData: ExamFormData) => {
    try {
      await createExam.mutateAsync({
        title: examData.title,
        totalMarks: examData.grade,
        studentId: examData.studentId,
        subjectId: examData.subjectId,
        status: examData.status === "upcoming" ? "pending" : "completed",
        dueDate: new Date(examData.dueDate).toISOString(), // ✅ هنا الحل
        duration: examData.duration,
      });

      setShowAddModal(false);
      setEditingExam(null);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDeleteExam = async (id: string) => {
    const ok = await confirm({
      title: language === "ar" ? "حذف" : "Delete",
      message: language === "ar" ? "هل أنت متأكد؟" : "Are you sure?",
    });

    if (ok) {
      try {
        await deleteExamMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (isError) return <div className="p-10 text-red-500">Error</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === "ar" ? "الامتحانات" : "Exams"}
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl"
        >
          <Plus className="w-5 h-5" />
          {language === "ar" ? "إضافة امتحان" : "Add Exam"}
        </button>
      </div>

      <AddExamModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onAdd={handleSaveExam}
        initialData={editingExam}
      />

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={text.search[language]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border rounded-xl text-right"
                dir="rtl"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border rounded-xl hover:bg-gray-50"
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
                className="px-4 py-2 border rounded-lg"
                dir="rtl"
              >
                <option value="">{text.columnStatus[language]}</option>
                <option value="upcoming">{text.upcoming[language]}</option>
                <option value="completed">{text.completed[language]}</option>
              </select>

              <input
                placeholder={text.columnSubject[language]}
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
                dir="rtl"
              />

              <input
                placeholder={text.columnStudent[language]}
                value={filters.student}
                onChange={(e) =>
                  setFilters({ ...filters, student: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
                dir="rtl"
              />
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">{text.columnTitle[language]}</th>
                <th className="px-6 py-4">{text.columnSubject[language]}</th>
                <th className="px-6 py-4">{text.columnStudent[language]}</th>
                <th className="px-6 py-4">{text.columnDueDate[language]}</th>
                <th className="px-6 py-4">{text.columnDuration[language]}</th>
                <th className="px-6 py-4">{text.columnTotalMarks[language]}</th>
                <th className="px-6 py-4">{text.columnGrade[language]}</th>
                <th className="px-6 py-4">{text.columnStatus[language]}</th>
                <th className="px-6 py-4">{text.columnActions[language]}</th>
              </tr>
            </thead>

            <tbody>
              {currentExams.map((exam) => (
                <tr key={exam.id} className="border-t hover:bg-gray-50">
                  <td className="text-center">{exam.title}</td>
                  <td className="text-center">{exam.subject}</td>
                  <td className="text-center">{exam.studentName}</td>
                  <td className="text-center">{exam.dueDate}</td>
                  <td className="text-center">{exam.duration}</td>
                  <td className="text-center">{exam.totalMarks}</td>
                  <td className="text-center">{exam.grade}</td>
                  {/* <td className="px-6 py-4">
                    <span
                      className={
                        exam.status === "upcoming"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {text[exam.status][language]}
                    </span>
                  </td> */}
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
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2 justify-start">
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        disabled={deleteExamMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setShowModal(true);
                        }}
                        className="p-2 icon-btn-primary rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-6 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredExams.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <ViewExamModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExamId(null);
        }}
        exam={examDetails?.data}
      />

      {ConfirmDialog}
    </div>
  );
}
