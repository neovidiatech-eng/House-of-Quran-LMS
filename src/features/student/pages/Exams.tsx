import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Mic,
  Clock,
  Calendar,
  Award,
  Video,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import { useExams, useExamDetails } from "../hooks/useExams";
import { useSubjects } from "../../admin/hooks/useSubjects";
import { Exam, ExamType } from "../../../types/exam";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import TakeExamModal from "../../../components/modals/TakeExamModal";
import ViewExamModal from "../../../components/modals/ViewExamModal";
import ViewMyAttemptModal from "../../../components/modals/ViewMyAttemptModal";

export default function Exams() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | ExamType>("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [examToTake, setExamToTake] = useState<Exam | null>(null);
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAttemptExam, setSelectedAttemptExam] = useState<Exam | null>(null);
  const [showMyAttemptModal, setShowMyAttemptModal] = useState(false);

  // Queries
  const { data, isLoading, isError, refetch } = useExams();
  const { data: subjData } = useSubjects();

  const { data: examDetailsData, isLoading: isDetailsLoading } = useExamDetails(
    selectedExamId || "",
    !!selectedExamId && showViewModal
  );

  // Safely extract raw exam list
  const rawList = data?.data;
  const exams: Exam[] = useMemo(() => {
    if (Array.isArray(rawList)) return rawList;
    if (Array.isArray((rawList as any)?.items)) return (rawList as any).items;
    if (Array.isArray(data)) return data;
    return [];
  }, [rawList, data]);

  const subjects = useMemo(() => {
    if (Array.isArray(subjData?.subjects)) return subjData.subjects;
    if (Array.isArray(subjData)) return subjData;
    return [];
  }, [subjData]);

  // Exam status helper
  const getStudentExamStatus = (exam: Exam) => {
    const hasAttempt =
      (exam.attempts && exam.attempts.length > 0) ||
      (exam as any).submissions?.length > 0 ||
      (exam as any).status === "completed";

    if (hasAttempt) {
      return {
        status: "COMPLETED",
        label: isRtl ? "تم التسليم" : "Completed",
        badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      };
    }

    if (!exam.startDate) {
      return {
        status: "ACTIVE",
        label: isRtl ? "متاح للتقديم" : "Available",
        badgeClass: "bg-blue-100 text-blue-800 border border-blue-200",
      };
    }

    const now = new Date().getTime();
    const start = new Date(exam.startDate).getTime();

    if (!isNaN(start) && now < start) {
      return {
        status: "UPCOMING",
        label: isRtl ? "قادم" : "Upcoming",
        badgeClass: "bg-amber-100 text-amber-800 border border-amber-300",
      };
    }

    return {
      status: "ACTIVE",
      label: isRtl ? "متاح الآن" : "Active Now",
      badgeClass: "bg-green-100 text-green-800 border border-green-300",
    };
  };

  // Filtered list
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const titleMatch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const subjNameAr = exam.subject?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
      const subjNameEn = exam.subject?.name_en?.toLowerCase().includes(searchTerm.toLowerCase());
      const teacherName = exam.teacher?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSearch =
        !searchTerm ||
        titleMatch ||
        descMatch ||
        subjNameAr ||
        subjNameEn ||
        teacherName;

      const matchesType = selectedType === "ALL" || exam.type === selectedType;
      const matchesSubject = !selectedSubjectId || exam.subjectId === selectedSubjectId;

      const statusObj = getStudentExamStatus(exam);
      const matchesStatus = !statusFilter || statusObj.status === statusFilter;

      return matchesSearch && matchesType && matchesSubject && matchesStatus;
    });
  }, [exams, searchTerm, selectedType, selectedSubjectId, statusFilter]);

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isRtl ? "الامتحانات والاختبارات" : "My Exams & Assessments"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRtl
              ? "استعرض الاختبارات المخصصة لك، وقدم إجاباتك وتابع نتائجك"
              : "Review your assigned exams, take assessments, and track your scores"}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Type Filter Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setSelectedType("ALL");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
              selectedType === "ALL"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {isRtl ? "جميع الاختبارات" : "All Exams"}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedType === "ALL"
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {exams.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedType("WRITTEN");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
              selectedType === "WRITTEN"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isRtl ? "اختبارات تحريرية" : "Written Exams"}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedType === "WRITTEN"
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {writtenCount}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedType("ORAL");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
              selectedType === "ORAL"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mic className="w-4 h-4" />
            {isRtl ? "اختبارات شفوية" : "Oral Exams"}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedType === "ORAL"
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {oralCount}
            </span>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                isRtl
                  ? "ابحث باسم الاختبار، المادة، المعلم..."
                  : "Search by exam title, subject, teacher..."
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Filter */}
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">{isRtl ? "كل المواد" : "All Subjects"}</option>
              {subjects.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {isRtl ? s.name_ar || s.name_en : s.name_en || s.name_ar}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">{isRtl ? "كل الحالات" : "All Statuses"}</option>
              <option value="ACTIVE">{isRtl ? "متاح الآن" : "Active / Available"}</option>
              <option value="UPCOMING">{isRtl ? "قادم" : "Upcoming"}</option>
              <option value="COMPLETED">{isRtl ? "تم التسليم" : "Completed"}</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">
              {isRtl ? "حدث خطأ أثناء تحميل الامتحانات" : "Error loading exams"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              {isRtl
                ? "يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً"
                : "Please check your network and try again"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {isRtl ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800">
              {isRtl ? "لا توجد اختبارات متاحة" : "No exams found"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isRtl
                ? "لم يتم تعيين أي اختبارات تطابق الفلاتر المحددة حالياً."
                : "No exams match your selected filters right now."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4 text-start">{isRtl ? "الاختبار" : "Exam"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "النوع" : "Type"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "المادة" : "Subject"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "المعلم" : "Teacher"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الموعد والمدة" : "Schedule"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الدرجات" : "Score"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentExams.map((exam) => {
                  const statusInfo = getStudentExamStatus(exam);
                  const isOral = exam.type === "ORAL";
                  const hasAttempt = statusInfo.status === "COMPLETED";
                  const attemptScore =
                    exam.attempts?.[0]?.score ??
                    (exam as any).grade ??
                    (exam as any).score;

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Title & Description */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl flex-shrink-0 ${
                              isOral
                                ? "bg-amber-50 text-amber-600"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isOral ? (
                              <Mic className="w-5 h-5" />
                            ) : (
                              <BookOpen className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate max-w-xs">
                              {exam.title}
                            </h4>
                            {exam.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                                {exam.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isOral
                              ? "bg-amber-100 text-amber-800"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isOral ? (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              {isRtl ? "شفوي" : "Oral"}
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5" />
                              {isRtl ? "تحريري" : "Written"}
                            </>
                          )}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {exam.subject?.color && (
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: exam.subject.color }}
                            />
                          )}
                          <span className="text-xs font-medium text-gray-800">
                            {isRtl
                              ? exam.subject?.name_ar || exam.subject?.name_en
                              : exam.subject?.name_en || exam.subject?.name_ar || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {exam.teacher?.user?.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Schedule & Duration */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(exam.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {exam.duration} {isRtl ? "دقيقة" : "min"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Score / Points */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasAttempt && attemptScore !== undefined ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <Award className="w-3.5 h-3.5" />
                            <span>
                              {attemptScore} / {exam.totalPoints || exam.passPoints}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs space-y-0.5">
                            <div className="font-semibold text-gray-800">
                              {exam.totalPoints || exam.passPoints} {isRtl ? "درجة" : "pts"}
                            </div>
                            <div className="text-gray-400">
                              {isRtl ? "النجاح:" : "Pass:"} {exam.passPoints}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.badgeClass}`}
                        >
                          {hasAttempt ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* 1. Take Exam button (WRITTEN, not completed, active or upcoming) */}
                          {!isOral && !hasAttempt && (
                            <button
                              onClick={() => {
                                setExamToTake(exam);
                                setShowTakeModal(true);
                              }}
                              className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/20 flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              {isRtl ? "بدء الاختبار" : "Take Exam"}
                            </button>
                          )}

                          {/* 2. Join Oral meeting button (ORAL) */}
                          {isOral && exam.link && (
                            <a
                              href={exam.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
                            >
                              <Video className="w-3.5 h-3.5" />
                              {isRtl ? "دخول المقابلة" : "Join Interview"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {/* 3. Completed: View My Graded Attempt & Score */}
                          {hasAttempt && (
                            <button
                              onClick={() => {
                                setSelectedAttemptExam(exam);
                                setShowMyAttemptModal(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5" />
                              {isRtl ? "عرض النتيجة والملاحظات" : "View Result & Feedback"}
                            </button>
                          )}

                          {/* 4. View Details */}
                          {/* <button
                            onClick={() => {
                              setSelectedExamId(exam.id);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            title={isRtl ? "عرض التفاصيل" : "View Details"}
                          >
                            <Eye className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredExams.length > itemsPerPage && (
          <div className="p-4 sm:p-6 border-t border-gray-100">
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

      {/* Take Exam Modal */}
      <TakeExamModal
        isOpen={showTakeModal}
        onClose={() => {
          setShowTakeModal(false);
          setExamToTake(null);
        }}
        exam={examToTake}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* View Exam Details Modal */}
      <ViewExamModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedExamId(null);
        }}
        exam={examDetailsData?.data || exams.find((e) => e.id === selectedExamId) || null}
        isLoading={isDetailsLoading}
      />

      {/* View My Attempt & Score Modal */}
      <ViewMyAttemptModal
        isOpen={showMyAttemptModal}
        onClose={() => {
          setShowMyAttemptModal(false);
          setSelectedAttemptExam(null);
        }}
        examId={selectedAttemptExam?.id || ""}
        examTitle={selectedAttemptExam?.title}
      />
    </div>
  );
}
