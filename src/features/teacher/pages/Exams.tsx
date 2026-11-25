import { useState, useMemo } from "react";
import {
  Search,
  Trash2,
  Plus,
  Eye,
  BookOpen,
  Mic,
  Clock,
  Calendar,
  Award,
  Video,
  ListFilter,
  Edit,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import { useConfirm } from "../../../hooks/useConfirm";
import AddExamModal from "../../../components/modals/ExamModal";
import ViewExamModal from "../../../components/modals/ViewExamModal";
import {
  useCreateExam,
  useDeleteExam,
  useExamDetails,
  useExams,
  useUpdateExam,
} from "../hooks/useExams";
import { getExamById } from "../services/ExamServices";
import { useSubjects } from "../../admin/hooks/useSubjects";
import { CreateExamPayload, Exam, ExamType } from "../../../types/exam";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";

export default function Exams() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | ExamType>("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showAddModal, setShowAddModal] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError } = useExams();
  const { data: subjData } = useSubjects();
  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const deleteExamMutation = useDeleteExam();
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: examDetailsData, isLoading: isDetailsLoading } = useExamDetails(
    selectedExamId || "",
    !!selectedExamId && showViewModal
  );

  // Safely extract exam list from response
  const rawList = data?.data;
  const exams: Exam[] = useMemo(() => {
    if (Array.isArray(rawList)) return rawList;
    if (Array.isArray((rawList as any)?.items)) return (rawList as any).items;
    return [];
  }, [rawList]);

  const subjects = subjData?.subjects || [];

  // Filtered list
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const titleMatch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const subjNameAr = exam.subject?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
      const subjNameEn = exam.subject?.name_en?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = !searchTerm || titleMatch || descMatch || subjNameAr || subjNameEn;

      const matchesType = selectedType === "ALL" || exam.type === selectedType;
      const matchesSubject = !selectedSubjectId || exam.subjectId === selectedSubjectId;

      return matchesSearch && matchesType && matchesSubject;
    });
  }, [exams, searchTerm, selectedType, selectedSubjectId]);

  // Counts
  const writtenCount = useMemo(
    () => exams.filter((e) => e.type === "WRITTEN").length,
    [exams]
  );
  const oralCount = useMemo(
    () => exams.filter((e) => e.type === "ORAL").length,
    [exams]
  );

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage) || 1;
  const currentExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open Edit Modal with full exam details (fetched via getExamById)
  const handleOpenEdit = async (examSummary: Exam) => {
    setExamToEdit(examSummary);
    setShowAddModal(true);
    setIsFetchingEdit(true);
    try {
      const res = await getExamById(examSummary.id);
      if (res?.data) {
        setExamToEdit(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch full exam for editing:", err);
    } finally {
      setIsFetchingEdit(false);
    }
  };

  // Create or Update
  const handleSaveExam = async (payload: any, id?: string) => {
    if (id) {
      await updateExamMutation.mutateAsync({ id, payload });
    } else {
      await createExamMutation.mutateAsync(payload);
    }
    setShowAddModal(false);
    setExamToEdit(null);
  };

  // Delete
  const handleDeleteExam = async (id: string) => {
    const ok = await confirm({
      title: isRtl ? "حذف الاختبار" : "Delete Exam",
      message: isRtl
        ? "هل أنت متأكد من رغبتك في حذف هذا الاختبار؟ لا يمكن التراجع عن هذا الإجراء."
        : "Are you sure you want to delete this exam? This action cannot be undone.",
    });

    if (ok) {
      try {
        await deleteExamMutation.mutateAsync(id);
      } catch (err) {
        console.error("Delete exam failed:", err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isRtl ? "إدارة الاختبارات" : "Exams Management"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRtl
              ? "إنشاء وتعديل ومتابعة الاختبارات التحريرية والشفوية لطلابك"
              : "Create, edit and manage written and oral exams"}
          </p>
        </div>

        <button
          onClick={() => {
            setExamToEdit(null);
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{isRtl ? "إنشاء اختبار جديد" : "Create New Exam"}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls: Search & Tabs & Subject Filter */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Type Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl">
              {[
                {
                  key: "ALL",
                  label: isRtl ? "الكل" : "All",
                  count: exams.length,
                  icon: <ListFilter className="w-4 h-4" />,
                },
                {
                  key: "WRITTEN",
                  label: isRtl ? "تحريري" : "Written",
                  count: writtenCount,
                  icon: <BookOpen className="w-4 h-4" />,
                },
                {
                  key: "ORAL",
                  label: isRtl ? "شفوي" : "Oral",
                  count: oralCount,
                  icon: <Mic className="w-4 h-4" />,
                },
              ].map((tab) => {
                const isActive = selectedType === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSelectedType(tab.key as any);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-200/80 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Subject */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Subject Filter */}
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-44 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{isRtl ? "جميع المواد" : "All Subjects"}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isRtl ? s.name_ar : s.name_en || s.name_ar}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <div className="w-full sm:w-64 relative">
                <Search
                  className={`absolute ${
                    isRtl ? "right-3.5" : "left-3.5"
                  } top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`}
                />
                <input
                  type="text"
                  placeholder={isRtl ? "بحث بالعنوان أو المادة..." : "Search title or subject..."}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full ${
                    isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
                  } py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={itemsPerPage} columns={8} />
          ) : isError ? (
            <div className="p-12 text-center text-red-500 font-bold">
              {isRtl ? "حدث خطأ أثناء تحميل الاختبارات" : "Error loading exams"}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "عنوان الاختبار" : "Exam Title"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "النوع" : "Type"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "المادة" : "Subject"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "الموعد" : "Start Date"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "المدة" : "Duration"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "درجة النجاح" : "Pass Points"}
                  </th>
                  {/* <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "التفاصيل" : "Details"}
                  </th> */}
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {currentExams.length > 0 ? (
                  currentExams.map((exam) => {
                    const isOral = exam.type === "ORAL";
                    // const qCount =
                    //   (exam as any)._count?.examQuestions ??
                    //   (exam as any)._count?.questions ??
                    //   (exam as any).questionsCount ??
                    //   (exam as any).examQuestionsCount ??
                    //   (exam as any).totalQuestions ??
                    //   (exam.examQuestions || exam.questions || []).length;

                    return (
                      <tr key={exam.id} className="hover:bg-primary-50/20 transition-colors group">
                        {/* Title & Description */}
                        <td className="px-6 py-4 text-start max-w-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                              {exam.title}
                            </span>
                            {exam.description && (
                              <span className="text-xs text-gray-400 truncate mt-0.5">
                                {exam.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          {isOral ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Mic className="w-3.5 h-3.5" />
                              {isRtl ? "شفوي" : "Oral"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <BookOpen className="w-3.5 h-3.5" />
                              {isRtl ? "تحريري" : "Written"}
                            </span>
                          )}
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <span className="font-medium text-gray-700">
                            {isRtl
                              ? exam.subject?.name_ar || exam.subject?.name_en || "—"
                              : exam.subject?.name_en || exam.subject?.name_ar || "—"}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span dir="ltr">{formatDate(exam.startDate)}</span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {exam.duration} {isRtl ? "دقيقة" : "min"}
                            </span>
                          </div>
                        </td>

                        {/* Pass Points */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-800">
                            <Award className="w-3.5 h-3.5 text-rose-500" />
                            <span>{exam.passPoints}</span>
                            {exam.totalPoints ? (
                              <span className="text-gray-400 font-normal">
                                / {exam.totalPoints}
                              </span>
                            ) : null}
                          </span>
                        </td>

                        {/* Details (Questions or Link) */}
{/* <td className="px-6 py-4 text-start whitespace-nowrap">
                          {isOral ? (
                            exam.link ? (
                              <a
                                href={exam.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>{isRtl ? "رابط المقابلة" : "Meeting Link"}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )                        
                          ) : (
                         
                          )}
                        </td> */}

                        {/* Actions */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <button
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setShowViewModal(true);
                              }}
                              className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                              title={isRtl ? "عرض التفاصيل" : "View Details"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(exam)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                              title={isRtl ? "تعديل الاختبار" : "Edit Exam"}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              disabled={deleteExamMutation.isPending}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                              title={isRtl ? "حذف الاختبار" : "Delete Exam"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <BookOpen className="w-12 h-12 text-gray-200" />
                        <p className="font-semibold text-gray-500">
                          {isRtl ? "لا توجد اختبارات مسجلة" : "No exams found"}
                        </p>
                        <button
                          onClick={() => {
                            setExamToEdit(null);
                            setShowAddModal(true);
                          }}
                          className="mt-1 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all"
                        >
                          + {isRtl ? "إنشاء اختبار جديد" : "Create New Exam"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredExams.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredExams.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Exam Modal */}
      <AddExamModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setExamToEdit(null);
        }}
        onSave={handleSaveExam}
        initialData={examToEdit}
        isLoading={isFetchingEdit}
      />

      {/* View Exam Modal */}
      <ViewExamModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedExamId(null);
        }}
        exam={
          (examDetailsData as any)?.data?.exam ||
          (examDetailsData as any)?.data ||
          (examDetailsData as any)?.exam ||
          filteredExams.find((e) => e.id === selectedExamId) ||
          null
        }
        isLoading={isDetailsLoading}
        onEdit={(exam) => {
          handleOpenEdit(exam);
        }}
      />

      {ConfirmDialog}
    </div>
  );
}
