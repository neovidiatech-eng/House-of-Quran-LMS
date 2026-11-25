import { useState, useMemo } from "react";
import {
  Search,
  Trash2,
  Eye,
  BookOpen,
  Mic,
  Clock,
  Calendar,
  Award,
  Video,
  ListFilter,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import { useConfirm } from "../../../hooks/useConfirm";
import ViewExamModal from "../../../components/modals/ViewExamModal";
import { useExams, useExamDetails, useDeleteExam } from "../hooks/useExams";
import { useSubjects } from "../hooks/useSubjects";
import { Exam, ExamType } from "../../../types/exam";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";

export default function Exams() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | ExamType>("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: apiResponse, isLoading, isError } = useExams();
  const { data: subjData } = useSubjects();
  const deleteExamMutation = useDeleteExam();
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: examDetailsData, isLoading: isDetailsLoading } = useExamDetails(
    selectedExamId || "",
    !!selectedExamId && showViewModal
  );

  // Safely extract exam list from response
  const exams: Exam[] = useMemo(() => {
    const rawList = apiResponse?.data;
    if (Array.isArray(rawList)) return rawList;
    if (Array.isArray((rawList as any)?.items)) return (rawList as any).items;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  const subjects = subjData?.subjects || [];

  // Filtered list
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const titleMatch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const subjNameAr = exam.subject?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
      const subjNameEn = exam.subject?.name_en?.toLowerCase().includes(searchTerm.toLowerCase());
      const teacherName = exam.teacher?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch =
        !searchTerm || titleMatch || descMatch || subjNameAr || subjNameEn || teacherName;

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

  // Delete Exam
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
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
              ? "متابعة وإدارة كافة الاختبارات التحريرية والشفوية المنشأة في المنصة"
              : "Monitor and manage all written and oral exams in the platform"}
          </p>
        </div>
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
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                <input
                  type="text"
                  placeholder={
                    isRtl
                      ? "البحث بالعنوان، المادة أو المعلم..."
                      : "Search title, subject, or teacher..."
                  }
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full ps-10 pe-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : isError ? (
            <div className="p-16 text-center text-red-500">
              <p className="font-semibold">
                {isRtl ? "حدث خطأ أثناء تحميل الاختبارات" : "Error loading exams"}
              </p>
            </div>
          ) : (
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
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
                    {isRtl ? "المعلم" : "Teacher"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "موعد البدء" : "Start Date"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "المدة" : "Duration"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "درجة النجاح" : "Pass Points"}
                  </th>
                  <th className="px-6 py-4 text-start whitespace-nowrap">
                    {isRtl ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {currentExams.length > 0 ? (
                  currentExams.map((exam) => {
                    const isOral = exam.type === "ORAL";

                    return (
                      <tr
                        key={exam.id}
                        className="hover:bg-primary-50/20 transition-colors group"
                      >
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
                          <div className="flex items-center gap-2">
                            {exam.subject?.color && (
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 ring-2 ring-gray-100"
                                style={{ backgroundColor: exam.subject.color }}
                              />
                            )}
                            <span className="font-medium text-gray-700 text-xs">
                              {isRtl
                                ? exam.subject?.name_ar || exam.subject?.name_en || "—"
                                : exam.subject?.name_en || exam.subject?.name_ar || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Teacher */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              {exam.teacher?.user?.name || (exam as any).teacherName || "—"}
                            </span>
                          </div>
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

                        {/* Actions */}
                        <td className="px-6 py-4 text-start whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {/* View Details */}
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
      />

      {ConfirmDialog}
    </div>
  );
}
