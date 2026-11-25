import { useState, useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  X,
  Calendar,
  Clock,
  GraduationCap,
  BookOpen,
  Award,
  Video,
  HelpCircle,
  CheckCircle2,
  FileText,
  Mic,
  Copy,
  Check,
  Users,
  ExternalLink,
  Edit,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Exam, QuestionType, StudentAttemptDetail } from "../../types/exam";
import { useExamAttempts } from "../../features/teacher/hooks/useExams";
import GradeAttemptModal from "./GradeAttemptModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  isLoading?: boolean;
  onEdit?: (exam: Exam) => void;
}

export default function ViewExamModal({
  isOpen,
  onClose,
  exam,
  isLoading,
  onEdit,
}: Props) {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "attempts">("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<"ALL" | QuestionType>("ALL");

  const [selectedAttemptToGrade, setSelectedAttemptToGrade] = useState<StudentAttemptDetail | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [attemptStatusFilter, setAttemptStatusFilter] = useState<string>("");

  const {
    data: attemptsData,
    isLoading: isAttemptsLoading,
    refetch: refetchAttempts,
  } = useExamAttempts(
    exam?.id || "",
    attemptStatusFilter ? { status: attemptStatusFilter } : undefined,
    isOpen && !!exam?.id
  );

  const isOral = exam?.type === "ORAL";

  const getExamStatus = () => {
    if (!exam?.startDate) return null;
    const now = new Date().getTime();
    const start = new Date(exam.startDate).getTime();
    const durationMs = (exam.duration || 0) * 60 * 1000;
    const end = start + durationMs;

    if (now < start) {
      return {
        label: isRtl ? "قادم" : "Upcoming",
        badgeClass: "bg-blue-100 text-blue-900 border border-blue-200",
      };
    } else if (now >= start && now <= end) {
      return {
        label: isRtl ? "جاري الآن" : "Ongoing",
        badgeClass: "bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse",
      };
    } else {
      return {
        label: isRtl ? "منتهي" : "Ended",
        badgeClass: "bg-gray-100 text-gray-800 border border-gray-200",
      };
    }
  };

  const statusInfo = getExamStatus();

  const formatDate = (date?: string) => {
    if (!date) return "—";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  const handleCopyLink = (linkToCopy?: string) => {
    if (!linkToCopy) return;
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Normalize questions from both examQuestions and questions, and options from examQuestionOptions and options
  const rawQuestions = exam?.examQuestions || exam?.questions || [];
  const normalizedQuestions = rawQuestions.map((q) => ({
    ...q,
    options: q.examQuestionOptions || q.options || [],
  }));

  const filteredQuestions = normalizedQuestions.filter((q) => {
    if (questionFilter === "ALL") return true;
    return q.type === questionFilter;
  });

  const totalQuestionsPoints = normalizedQuestions.reduce(
    (acc, q) => acc + (Number(q.points) || 0),
    0
  );

  const attemptsList: any[] = useMemo(() => {
    const raw = attemptsData?.data || attemptsData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (exam?.attempts && Array.isArray(exam.attempts)) return exam.attempts;
    return [];
  }, [attemptsData, exam?.attempts]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-primary to-emerald-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md">
              {isOral ? <Mic className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold leading-tight">
                  {exam?.title || (isRtl ? "تفاصيل الاختبار" : "Exam Details")}
                </h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isOral
                      ? "bg-amber-400 text-amber-950"
                      : "bg-white/20 text-white border border-white/30"
                  }`}
                >
                  {isOral
                    ? isRtl
                      ? "اختبار شفوي (ORAL)"
                      : "Oral Exam"
                    : isRtl
                    ? "اختبار تحريري (WRITTEN)"
                    : "Written Exam"}
                </span>

                {statusInfo && (
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-sm ${statusInfo.badgeClass}`}
                  >
                    {statusInfo.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {isRtl ? "عرض ومراجعة كامل بيانات الاختبار" : "View complete exam details"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && exam && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(exam);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{isRtl ? "تعديل الاختبار" : "Edit Exam"}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !exam ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">
              {isRtl ? "جاري تحميل تفاصيل الاختبار..." : "Loading exam details..."}
            </p>
          </div>
        ) : !exam ? (
          <div className="p-16 text-center text-gray-400">
            <p>{isRtl ? "لم يتم العثور على بيانات هذا الاختبار" : "No exam data found"}</p>
          </div>
        ) : (
          <>
            {/* Modal Internal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isRtl ? "نظرة عامة والبيانات" : "Overview & Info"}</span>
              </button>

              {!isOral && (
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "questions"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{isRtl ? "الأسئلة والإجابات" : "Questions & Answers"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                    {normalizedQuestions.length}
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("attempts")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "attempts"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{isRtl ? "محاولات الطلاب" : "Student Attempts"}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">
                  {exam.attempts?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Description Box */}
                  <div className="bg-gradient-to-br from-emerald-50/40 to-teal-50/20 border border-emerald-100 rounded-2xl p-5">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      {isRtl ? "وصف الاختبار" : "Exam Description"}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {exam.description || (isRtl ? "لا يوجد وصف مدخل لهذا الاختبار." : "No description provided.")}
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <InfoCard
                      icon={<BookOpen className="w-5 h-5 text-purple-600" />}
                      iconBg="bg-purple-50"
                      label={isRtl ? "المادة الدراسية" : "Subject"}
                      value={
                        exam.subject ? (
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                            {exam.subject.color && (
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 ring-2 ring-gray-100"
                                style={{ backgroundColor: exam.subject.color }}
                              />
                            )}
                            <span>
                              {isRtl
                                ? exam.subject.name_ar || exam.subject.name_en
                                : exam.subject.name_en || exam.subject.name_ar}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )
                      }
                    />

                    <InfoCard
                      icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
                      iconBg="bg-emerald-50"
                      label={isRtl ? "المعلم المسؤول" : "Teacher"}
                      value={
                        exam.teacher?.user?.name ||
                        (exam as any).teacherName ||
                        "—"
                      }
                    />

                    <InfoCard
                      icon={<Calendar className="w-5 h-5 text-blue-600" />}
                      iconBg="bg-blue-50"
                      label={isRtl ? "تاريخ ووقت البدء" : "Start Date"}
                      value={formatDate(exam.startDate)}
                    />

                    <InfoCard
                      icon={<Clock className="w-5 h-5 text-amber-600" />}
                      iconBg="bg-amber-50"
                      label={isRtl ? "المدة المتاحة" : "Duration"}
                      value={`${exam.duration} ${isRtl ? "دقيقة" : "minutes"}`}
                    />

                    <InfoCard
                      icon={<Award className="w-5 h-5 text-rose-600" />}
                      iconBg="bg-rose-50"
                      label={isRtl ? "درجة النجاح المطلوبة" : "Pass Points"}
                      value={`${exam.passPoints} ${isRtl ? "درجة" : "points"}`}
                    />

                    <InfoCard
                      icon={<FileText className="w-5 h-5 text-indigo-600" />}
                      iconBg="bg-indigo-50"
                      label={
                        isOral
                          ? isRtl
                            ? "نوع الاختبار"
                            : "Exam Type"
                          : isRtl
                          ? "إجمالي درجات الأسئلة"
                          : "Total Questions Points"
                      }
                      value={
                        isOral
                          ? isRtl
                            ? "شفوي ومقابلة"
                            : "Oral Interview"
                          : `${totalQuestionsPoints || exam.totalPoints || 0} ${isRtl ? "درجة" : "pts"}`
                      }
                    />

                    {exam.studentId && (
                      <InfoCard
                        icon={<Users className="w-5 h-5 text-teal-600" />}
                        iconBg="bg-teal-50"
                        label={isRtl ? "الطالب المخصص له" : "Assigned Student"}
                        value={
                          (exam as any).student?.user?.name ||
                          (exam as any).student?.name ||
                          (exam as any).studentName ||
                          exam.studentId
                        }
                      />
                    )}
                  </div>

                  {/* ORAL SPECIFIC HIGHLIGHT CARD */}
                  {isOral && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-600 text-white rounded-xl">
                            <Mic className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-950 text-sm">
                              {isRtl ? "بيانات الاختبار الشفوي والمقابلة" : "Oral Exam & Interview"}
                            </h4>
                            <p className="text-xs text-emerald-800">
                              {isRtl ? "جلسة تلاوة ومراجعة الأحكام مع المشرف المعتمد" : "Oral recitation with certified supervisor"}
                            </p>
                          </div>
                        </div>

                        {exam.link && (
                          <a
                            href={exam.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                          >
                            <Video className="w-4 h-4" />
                            <span>{isRtl ? "دخول المقابلة الآن" : "Join Interview"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Supervisor Info */}
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                          <span className="text-xs font-semibold text-gray-500 mb-1">
                            {isRtl ? "المشرف المعتمد:" : "Assigned Supervisor:"}
                          </span>
                          <span className="font-mono text-sm font-bold text-gray-800 truncate">
                            {exam.supervisorId || (isRtl ? "لم يحدد" : "Not specified")}
                          </span>
                        </div>

                        {/* Meeting Link with Copy Button */}
                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                          <span className="text-xs font-semibold text-gray-500 mb-1">
                            {isRtl ? "رابط الجلسة:" : "Session Link:"}
                          </span>
                          {exam.link ? (
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className="text-xs text-primary font-mono truncate max-w-[200px]" dir="ltr">
                                {exam.link}
                              </span>
                              <button
                                onClick={() => handleCopyLink(exam.link!)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  copiedLink
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                                title={isRtl ? "نسخ الرابط" : "Copy Link"}
                              >
                                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedLink ? (isRtl ? "تم النسخ" : "Copied!") : (isRtl ? "نسخ" : "Copy")}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: QUESTIONS (WRITTEN ONLY) */}
              {activeTab === "questions" && !isOral && (
                <div className="space-y-5">
                  {/* Filter & Summary Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {isRtl ? "قائمة أسئلة الاختبار" : "Questions List"} ({normalizedQuestions.length})
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isRtl
                          ? `إجمالي الدرجات: ${totalQuestionsPoints} درجة • درجة النجاح: ${exam.passPoints} درجة`
                          : `Total: ${totalQuestionsPoints} pts • Pass: ${exam.passPoints} pts`}
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
                      {(
                        [
                          { key: "ALL", label: isRtl ? "الكل" : "All" },
                          { key: "MCQ", label: isRtl ? "اختيار من متعدد" : "MCQ" },
                          { key: "TRUE_FALSE", label: isRtl ? "صح أو خطأ" : "True/False" },
                          { key: "ESSAY", label: isRtl ? "مقالي" : "Essay" },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setQuestionFilter(item.key)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                            questionFilter === item.key
                              ? "bg-primary text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Questions Cards */}
                  {filteredQuestions.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      <HelpCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm">{isRtl ? "لا توجد أسئلة مسجلة في هذا الاختبار" : "No questions found"}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuestions.map((q, qIdx) => {
                        const isMcq = q.type === "MCQ";
                        const isTrueFalse = q.type === "TRUE_FALSE";
                        const isEssay = q.type === "ESSAY";

                        return (
                          <div
                            key={q.id || qIdx}
                            className="bg-white border border-gray-200 hover:border-primary/40 rounded-2xl p-5 shadow-sm space-y-3.5 transition-all"
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">
                                  #{qIdx + 1}
                                </span>
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                    isMcq
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : isTrueFalse
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  {isMcq
                                    ? isRtl
                                      ? "اختيار من متعدد (MCQ)"
                                      : "Multiple Choice"
                                    : isTrueFalse
                                    ? isRtl
                                      ? "صح أو خطأ (True / False)"
                                      : "True / False"
                                    : isRtl
                                    ? "سؤال مقالي (Essay)"
                                    : "Essay"}
                                </span>
                              </div>

                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                                {q.points} {isRtl ? "درجات" : "pts"}
                              </span>
                            </div>

                            {/* Question Statement */}
                            <p className="text-sm font-bold text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {q.question}
                            </p>

                            {/* Options if Objective */}
                            {q.options && q.options.length > 0 && (
                              <div className="pt-2 border-t border-gray-100 space-y-2">
                                <span className="text-xs font-bold text-gray-400 block mb-1">
                                  {isRtl ? "الخيارات المتاحة:" : "Available Options:"}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium transition ${
                                        opt.isCorrect
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                                          : "bg-gray-50/70 border-gray-200 text-gray-700"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        {opt.isCorrect ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        ) : (
                                          <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                                        )}
                                        <span className="truncate font-semibold">{opt.option}</span>
                                      </div>

                                      {opt.isCorrect && (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0">
                                          {isRtl ? "الإجابة الصحيحة" : "Correct"}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Essay Notice */}
                            {isEssay && (
                              <div className="pt-2 border-t border-gray-100">
                                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>
                                    {isRtl
                                      ? "سؤال مقالي مفتوح: يقدم الطالب إجابته كتابياً ويتم تصحيحها وإسناد الدرجة يدوياً."
                                      : "Open essay question: Student submits a written answer, graded manually by teacher."}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ATTEMPTS */}
              {activeTab === "attempts" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {isRtl ? "سجل محاولات الطلاب والتصحيح" : "Student Attempts & Grading"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isRtl
                          ? `عدد المحاولات: ${attemptsList.length}`
                          : `Total attempts: ${attemptsList.length}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Filter by status */}
                      <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 text-xs font-semibold">
                        <button
                          onClick={() => setAttemptStatusFilter("")}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            !attemptStatusFilter
                              ? "bg-primary text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {isRtl ? "الكل" : "All"}
                        </button>
                        <button
                          onClick={() => setAttemptStatusFilter("submitted")}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            attemptStatusFilter === "submitted"
                              ? "bg-amber-500 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {isRtl ? "بانتظار التصحيح" : "Pending Grading"}
                        </button>
                        <button
                          onClick={() => setAttemptStatusFilter("graded")}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            attemptStatusFilter === "graded"
                              ? "bg-emerald-600 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {isRtl ? "تم التصحيح" : "Graded"}
                        </button>
                      </div>

                      <button
                        onClick={() => refetchAttempts()}
                        className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition"
                        title={isRtl ? "تحديث" : "Refresh"}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isAttemptsLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs text-gray-500">
                        {isRtl ? "جاري تحميل محاولات الطلاب..." : "Loading student attempts..."}
                      </p>
                    </div>
                  ) : attemptsList.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-500">
                        {isRtl
                          ? "لا توجد محاولات مطابقة حالياً"
                          : "No matching student attempts found"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {isRtl
                          ? "عندما يقوم الطلاب بحل وتسليم هذا الاختبار ستظهر إجاباتهم ومحاولاتهم هنا."
                          : "Student attempts and answers will appear here once submitted."}
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                          <tr>
                            <th className="px-4 py-3 text-start">{isRtl ? "الطالب" : "Student"}</th>
                            <th className="px-4 py-3 text-start">{isRtl ? "الدرجة" : "Score"}</th>
                            <th className="px-4 py-3 text-start">{isRtl ? "الحالة" : "Status"}</th>
                            <th className="px-4 py-3 text-start">{isRtl ? "تاريخ المحاولة" : "Date"}</th>
                            <th className="px-4 py-3 text-start">{isRtl ? "الإجراء" : "Action"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {attemptsList.map((att: any, idx: number) => {
                            const isPassed =
                              att.passed ??
                              (att.score && exam.passPoints
                                ? att.score >= exam.passPoints
                                : false);
                            const isPendingGrading =
                              att.status === "submitted" ||
                              (!att.score && att.status !== "graded");

                            return (
                              <tr key={att.id || idx} className="hover:bg-gray-50/60">
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  <div>
                                    <p className="text-gray-900 font-bold">
                                      {att.student?.user?.name ||
                                        att.student?.name ||
                                        att.studentName ||
                                        `طالب #${idx + 1}`}
                                    </p>
                                    {att.student?.user?.email && (
                                      <p className="text-[10px] text-gray-400 font-normal">
                                        {att.student.user.email}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-800">
                                  {att.score ?? "—"} / {exam.totalPoints || totalQuestionsPoints || 100}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                      isPendingGrading
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : isPassed
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {isPendingGrading
                                      ? isRtl
                                        ? "بانتظار التصحيح"
                                        : "Pending Grading"
                                      : isPassed
                                      ? isRtl
                                        ? "ناجح"
                                        : "Passed"
                                      : isRtl
                                      ? "راسب"
                                      : "Failed"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500" dir="ltr">
                                  {formatDate(att.createdAt || att.date)}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => {
                                      setSelectedAttemptToGrade(att);
                                      setShowGradeModal(true);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                                      isPendingGrading
                                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                    }`}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    {isRtl
                                      ? isPendingGrading
                                        ? "تصحيح المحاولة"
                                        : "تعديل الدرجة"
                                      : isPendingGrading
                                      ? "Grade Attempt"
                                      : "Edit Grades"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-xs shadow-md transition-colors"
              >
                {isRtl ? "إغلاق" : "Close"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Grade Attempt Modal */}
      <GradeAttemptModal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedAttemptToGrade(null);
        }}
        examId={exam?.id || ""}
        attempt={selectedAttemptToGrade}
        examQuestions={normalizedQuestions}
        onSuccess={() => {
          refetchAttempts();
        }}
      />
    </div>
  );
}


function InfoCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow transition">
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400">{label}</p>
        <p className="font-bold text-gray-900 text-xs sm:text-sm truncate mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}
