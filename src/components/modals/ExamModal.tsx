import { useState, useEffect } from "react";
import { X, Plus, Trash2, BookOpen, Mic, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomSelect from "../ui/CustomSelect";
import { useSubjects } from "../../features/admin/hooks/useSubjects";
import { useSupervisors } from "../../features/teacher/hooks/useExams";
import {
  CreateExamPayload,
  Exam,
  ExamQuestion,
  ExamType,
  QuestionType,
} from "../../types/exam";
import { useMyStudents } from "../../features/teacher/hooks/useMyStudents";

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any, id?: string) => Promise<void> | void;
  initialData?: Exam | null;
  isLoading?: boolean;
}

export default function AddExamModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}: AddExamModalProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const isEdit = !!initialData;

  const { data: subjData } = useSubjects();
  const { data: supervisorsData } = useSupervisors();

  const { data: mystudents } = useMyStudents();

  const students =
    mystudents?.data
      ?.filter((s): s is typeof s & { id: string } => Boolean(s.id))
      .map((s) => ({
        value: s.id,
        label: s.name,
      })) || [];

  const subjects =
    subjData?.subjects?.map((s) => ({
      value: s.id,
      label: isRtl ? s.name_ar : s.name_en || s.name_ar,
    })) || [];

  const rawSupervisors = supervisorsData?.data?.items || (supervisorsData as any)?.data || [];
  const supervisors =
    rawSupervisors?.map((sup: any) => ({
      value: sup.id,
      label: sup.user?.name || sup.name || `مشرف (${sup.id.slice(0, 6)})`,
    })) || [];

  // Form State
  const [examType, setExamType] = useState<ExamType>("WRITTEN");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [passPoints, setPassPoints] = useState<number>(50);

  // Oral specific
  const [supervisorId, setSupervisorId] = useState("");
  const [link, setLink] = useState("");

  // Written specific: questions
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      question: "",
      type: "MCQ",
      points: 5,
      options: [
        { option: "", isCorrect: true },
        { option: "", isCorrect: false },
      ],
    },
  ]);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format ISO to datetime-local input format (YYYY-MM-DDTHH:mm)
  const toLocalInputFormat = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  // Pre-fill or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setExamType(initialData.type || "WRITTEN");
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setSubjectId(initialData.subjectId || "");
        setStartDate(toLocalInputFormat(initialData.startDate));
        setDuration(initialData.duration || 30);
        setPassPoints(initialData.passPoints || 10);
        setSupervisorId(initialData.supervisorId || "");
        setLink(initialData.link || "");
        setStudentId(initialData.studentId || "");

        const rawQs = initialData.examQuestions || initialData.questions || [];
        if (rawQs.length > 0) {
          setQuestions(
            rawQs.map((q) => {
              const rawOpts = q.examQuestionOptions || q.options || [];
              return {
                question: q.question || "",
                type: q.type || "MCQ",
                points: q.points || 5,
                options:
                  q.type === "ESSAY"
                    ? undefined
                    : rawOpts.map((o) => ({
                        option: o.option || "",
                        isCorrect: Boolean(o.isCorrect),
                      })),
              };
            })
          );
        } else if (!isLoading) {
          setQuestions([
            {
              question: "",
              type: "MCQ",
              points: 5,
              options: [
                { option: "", isCorrect: true },
                { option: "", isCorrect: false },
              ],
            },
          ]);
        }
      } else {
        setExamType("WRITTEN");
        setTitle("");
        setDescription("");
        setSubjectId("");
        setStartDate("");
        setDuration(30);
        setPassPoints(10);
        setSupervisorId("");
        setLink("");
        setStudentId("");
        setQuestions([
          {
            question: "",
            type: "MCQ",
            points: 5,
            options: [
              { option: "", isCorrect: true },
              { option: "", isCorrect: false },
            ],
          },
        ]);
      }
      setFormError("");
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, isLoading]);

  if (!isOpen) return null;

  // Add question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        type: "MCQ",
        points: 5,
        options: [
          { option: "", isCorrect: true },
          { option: "", isCorrect: false },
        ],
      },
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Update question field
  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const updated = { ...q, [field]: value };

        if (field === "type") {
          const newType = value as QuestionType;
          if (newType === "TRUE_FALSE") {
            updated.options = [
              { option: isRtl ? "صواب" : "True", isCorrect: true },
              { option: isRtl ? "خطأ" : "False", isCorrect: false },
            ];
          } else if (newType === "MCQ") {
            updated.options = [
              { option: "", isCorrect: true },
              { option: "", isCorrect: false },
            ];
          } else {
            // ESSAY
            delete updated.options;
          }
        }

        return updated;
      })
    );
  };

  // Add option to MCQ question
  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = q.options || [];
        return {
          ...q,
          options: [...opts, { option: "", isCorrect: false }],
        };
      })
    );
  };

  // Remove option from MCQ question
  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = q.options || [];
        if (opts.length <= 2) return q;
        return {
          ...q,
          options: opts.filter((_, oIdx) => oIdx !== optIndex),
        };
      })
    );
  };

  // Update option text or correct status
  const handleUpdateOption = (
    qIndex: number,
    optIndex: number,
    field: "option" | "isCorrect",
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = (q.options || []).map((opt, oIdx) => {
          if (field === "isCorrect") {
            return { ...opt, isCorrect: oIdx === optIndex };
          }
          if (oIdx === optIndex) {
            return { ...opt, [field]: value };
          }
          return opt;
        });
        return { ...q, options: opts };
      })
    );
  };

  const totalWrittenPoints = questions.reduce(
    (sum, q) => sum + (Number(q.points) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError(isRtl ? "يرجى إدخال عنوان الاختبار" : "Please enter exam title");
      return;
    }
    if (!duration || Number(duration) <= 0) {
      setFormError(isRtl ? "يرجى إدخال مدة صحيحة" : "Please enter a valid duration");
      return;
    }

    // IF EDIT MODE: Send update payload with updated fields (title, description, duration, etc.)
    if (isEdit && initialData?.id) {
      const updatePayload: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
      };

      if (startDate) {
        updatePayload.startDate = new Date(startDate).toISOString();
      }
      if (passPoints !== undefined && passPoints !== null && passPoints !== ("" as any)) {
        updatePayload.passPoints = Number(passPoints);
      }
      if (examType === "ORAL") {
        if (supervisorId) updatePayload.supervisorId = supervisorId;
        if (link.trim()) updatePayload.link = link.trim();
      }

      try {
        setIsSubmitting(true);
        await onSave(updatePayload, initialData.id);
        onClose();
      } catch (err: any) {
        setFormError(err?.response?.data?.message || err?.message || "Failed to save exam");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // IF CREATE MODE:
    if (!subjectId) {
      setFormError(isRtl ? "يرجى اختيار المادة" : "Please select subject");
      return;
    }
    if (!studentId) {
      setFormError(isRtl ? "يرجى اختيار الطالب" : "Please select student");
      return;
    }
    if (!startDate) {
      setFormError(isRtl ? "يرجى تحديد موعد الاختبار" : "Please select exam date & time");
      return;
    }

    const isoStartDate = new Date(startDate).toISOString();

    if (examType === "ORAL") {
      if (!supervisorId) {
        setFormError(isRtl ? "يرجى اختيار المشرف للاختبار الشفوي" : "Please select supervisor for oral exam");
        return;
      }
      if (!link.trim()) {
        setFormError(isRtl ? "يرجى إدخال رابط الاجتماع للاختبار الشفوي" : "Please enter meeting link");
        return;
      }

      const payload: CreateExamPayload = {
        title: title.trim(),
        description: description.trim(),
        type: "ORAL",
        startDate: isoStartDate,
        duration: Number(duration),
        passPoints: Number(passPoints) || 0,
        subjectId,
        studentId,
        supervisorId,
        link: link.trim(),
      };

      try {
        setIsSubmitting(true);
        await onSave(payload);
        onClose();
      } catch (err: any) {
        setFormError(err?.response?.data?.message || err?.message || "Failed to save exam");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // WRITTEN
      if (questions.length === 0) {
        setFormError(isRtl ? "يرجى إضافة سؤال واحد على الأقل" : "Please add at least one question");
        return;
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) {
          setFormError(
            isRtl
              ? `يرجى كتابة نص السؤال رقم ${i + 1}`
              : `Please enter question text for question #${i + 1}`
          );
          return;
        }
        if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
          if (!q.options || q.options.length < 2) {
            setFormError(
              isRtl
                ? `السؤال رقم ${i + 1} يتطلب خيارين على الأقل`
                : `Question #${i + 1} requires at least 2 options`
            );
            return;
          }
          const hasEmptyOpt = q.options.some((o) => !o.option.trim());
          if (hasEmptyOpt) {
            setFormError(
              isRtl
                ? `يرجى ملء جميع الخيارات في السؤال رقم ${i + 1}`
                : `Please fill all options in question #${i + 1}`
            );
            return;
          }
          const hasCorrect = q.options.some((o) => o.isCorrect);
          if (!hasCorrect) {
            setFormError(
              isRtl
                ? `يرجى تحديد الإجابة الصحيحة في السؤال رقم ${i + 1}`
                : `Please select the correct option for question #${i + 1}`
            );
            return;
          }
        }
      }

      const payload: CreateExamPayload = {
        title: title.trim(),
        description: description.trim(),
        type: "WRITTEN",
        startDate: isoStartDate,
        duration: Number(duration),
        passPoints: Number(passPoints) || 0,
        subjectId,
        studentId,
        questions: questions.map((q) => {
          const item: ExamQuestion = {
            question: q.question.trim(),
            type: q.type,
            points: Number(q.points) || 1,
          };
          if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
            item.options = q.options?.map((o) => ({
              option: o.option.trim(),
              isCorrect: !!o.isCorrect,
            }));
          }
          return item;
        }),
      };

      try {
        setIsSubmitting(true);
        await onSave(payload, initialData?.id);
        onClose();
      } catch (err: any) {
        setFormError(err?.response?.data?.message || err?.message || "Failed to save exam");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary px-6 py-5 flex items-center justify-between rounded-t-3xl z-30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit
                  ? isRtl
                    ? "تعديل الاختبار"
                    : "Edit Exam"
                  : isRtl
                  ? "إنشاء اختبار جديد"
                  : "Create New Exam"}
              </h2>
              <p className="text-xs text-white/80">
                {isEdit
                  ? isRtl
                    ? "قم بتحديث بيانات الاختبار وحفظ التعديلات"
                    : "Update exam details and save changes"
                  : isRtl
                  ? "قم بتحديد نوع الاختبار وإدخال البيانات المطلوبة"
                  : "Set exam type and fill details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Loading */}
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-600">
              {isRtl ? "جاري جلب تفاصيل وأسئلة الاختبار..." : "Loading exam details and questions..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Exam Type Selector Cards */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">
              {isRtl ? "نوع الاختبار *" : "Exam Type *"}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isEdit}
                onClick={() => !isEdit && setExamType("WRITTEN")}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-start ${
                  examType === "WRITTEN"
                    ? "border-primary bg-primary-50/40 text-primary shadow-sm"
                    : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                } ${isEdit ? "opacity-80 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    examType === "WRITTEN" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {isRtl ? "اختبار تحريري" : "Written Exam"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isRtl ? "اختيار من متعدد، صح وخطأ، أو مقالي" : "MCQ, True/False, or Essay"}
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={isEdit}
                onClick={() => !isEdit && setExamType("ORAL")}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-start ${
                  examType === "ORAL"
                    ? "border-primary bg-primary-50/40 text-primary shadow-sm"
                    : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                } ${isEdit ? "opacity-80 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    examType === "ORAL" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {isRtl ? "اختبار شفوي" : "Oral Exam"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isRtl ? "جلسة تلاوة ومقابلة مع المشرف" : "Oral recitation with supervisor"}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* General Details */}
          <div className="space-y-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-sm text-gray-800 border-b border-gray-200/60 pb-2">
              {isRtl ? "البيانات الأساسية" : "Basic Information"}
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {isRtl ? "عنوان الاختبار *" : "Exam Title *"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRtl ? "مثال: اختبار أحكام التجويد الشامل" : "e.g. Tajweed Final Exam"}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {isRtl ? "وصف الاختبار" : "Description"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={isRtl ? "اكتب نبذة مختصرة عن الاختبار..." : "Short description..."}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800 resize-none"
              />
            </div>

            {/* Subject & Student */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={isEdit ? "opacity-75 pointer-events-none" : ""}>
                <CustomSelect
                  label={isRtl ? "المادة الدراسية *" : "Subject *"}
                  value={subjectId}
                  onChange={(val) => setSubjectId(val as string)}
                  options={subjects}
                />
              </div>

              <div className={isEdit ? "opacity-75 pointer-events-none" : ""}>
                <CustomSelect
                  label={isRtl ? "الطالب *" : "Student *"}
                  value={studentId || undefined}
                  onChange={(val) => setStudentId((val as string) || "")}
                  options={students}
                  placeholder={isRtl ? "اختر الطالب *" : "Select Student *"}
                  disabled={isEdit}
                />
              </div>
            </div>

            {/* Start Date & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {isRtl ? "تاريخ ووقت البدء *" : "Start Date & Time *"}
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {isRtl ? "المدة (بالدقائق) *" : "Duration (Minutes) *"}
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Pass Points */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {isRtl ? "درجة النجاح *" : "Pass Points *"}
              </label>
              <input
                type="number"
                min="1"
                value={passPoints}
                onChange={(e) => setPassPoints(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800"
              />
            </div>
          </div>

          {/* ORAL SPECIFIC FIELDS */}
          {examType === "ORAL" && (
            <div className="space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2 border-b border-emerald-200/50 pb-2">
                <Mic className="w-4 h-4 text-emerald-600" />
                {isRtl ? "بيانات الاختبار الشفوي" : "Oral Exam Details"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <CustomSelect
                    label={isRtl ? "المشرف المعتمد *" : "Supervisor *"}
                    value={supervisorId}
                    onChange={(val) => setSupervisorId(val as string)}
                    options={supervisors}
                  />
                  {supervisors.length === 0 && (
                    <input
                      type="text"
                      placeholder={isRtl ? "أو أدخل معرف المشرف supervisorId" : "Or enter supervisorId"}
                      value={supervisorId}
                      onChange={(e) => setSupervisorId(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {isRtl ? "رابط الاجتماع / المقابلة *" : "Meeting Link *"}
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://meet.jit.si/..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-800"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WRITTEN SPECIFIC: QUESTIONS BUILDER OR EDIT INFO */}
          {examType === "WRITTEN" && (
            <div className="space-y-4">
              {isEdit ? (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-amber-950">
                        {isRtl ? "أسئلة الاختبار" : "Exam Questions"}
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {isRtl
                          ? `يتضمن هذا الاختبار (${questions.length}) أسئلة. تعديل الاختبار يختص بالعنوان والوصف والمدة ودرجة النجاح.`
                          : `This exam contains (${questions.length}) questions. Edit mode updates exam title, description, duration, and pass points.`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-3 py-1 rounded-full">
                    {questions.length} {isRtl ? "سؤال" : "questions"}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        {isRtl ? "أسئلة الاختبار" : "Exam Questions"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isRtl
                          ? `إجمالي درجات الأسئلة: ${totalWrittenPoints} درجة (درجة النجاح: ${passPoints})`
                          : `Total Points: ${totalWrittenPoints} (Pass: ${passPoints})`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {isRtl ? "إضافة سؤال" : "Add Question"}
                    </button>
                  </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3.5 relative group hover:border-primary/40 transition-all"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">
                          #{qIdx + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleUpdateQuestion(qIdx, "type", e.target.value as QuestionType)
                          }
                          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="MCQ">{isRtl ? "اختيار من متعدد (MCQ)" : "Multiple Choice"}</option>
                          <option value="TRUE_FALSE">{isRtl ? "صح أو خطأ (True/False)" : "True / False"}</option>
                          <option value="ESSAY">{isRtl ? "سؤال مقالي (Essay)" : "Essay Question"}</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-gray-500">{isRtl ? "الدرجة:" : "Points:"}</label>
                          <input
                            type="number"
                            min="1"
                            value={q.points}
                            onChange={(e) =>
                              handleUpdateQuestion(qIdx, "points", Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-center"
                          />
                        </div>

                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={isRtl ? "حذف السؤال" : "Delete question"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                        rows={2}
                        placeholder={
                          isRtl
                            ? `اكتب نص السؤال رقم ${qIdx + 1} هنا...`
                            : `Write question #${qIdx + 1} text here...`
                        }
                        className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Question Options for MCQ & TRUE_FALSE */}
                    {(q.type === "MCQ" || q.type === "TRUE_FALSE") && (
                      <div className="space-y-2 pt-1 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {isRtl
                              ? "الخيارات (حدد الخيار الصحيح):"
                              : "Options (mark the correct answer):"}
                          </span>
                          {q.type === "MCQ" && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(qIdx)}
                              className="text-primary hover:underline font-bold"
                            >
                              + {isRtl ? "خيار إضافي" : "Add option"}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                opt.isCorrect
                                  ? "border-emerald-300 bg-emerald-50/60"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateOption(qIdx, optIdx, "isCorrect", true)
                                }
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  opt.isCorrect
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-gray-300 hover:border-gray-400 bg-white"
                                }`}
                                title={isRtl ? "تحديد كإجابة صحيحة" : "Mark as correct"}
                              >
                                {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              {q.type === "TRUE_FALSE" ? (
                                <span className="text-sm font-semibold text-gray-800 flex-1">
                                  {opt.option}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  value={opt.option}
                                  onChange={(e) =>
                                    handleUpdateOption(qIdx, optIdx, "option", e.target.value)
                                  }
                                  placeholder={
                                    isRtl ? `الخيار ${optIdx + 1}` : `Option ${optIdx + 1}`
                                  }
                                  className="w-full bg-transparent text-sm focus:outline-none"
                                />
                              )}

                              {q.type === "MCQ" && (q.options?.length || 0) > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(qIdx, optIdx)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notice for ESSAY */}
                    {q.type === "ESSAY" && (
                      <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-800">
                        {isRtl
                          ? "سؤال مقالي: سيقوم الطالب بكتابة إجابته نصياً ويتم مراجعتها وتصحيحها يدوياً."
                          : "Essay question: Students write their answers in text, graded manually."}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-white hover:bg-primary/95 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting
                ? isRtl
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isEdit
                ? isRtl
                  ? "حفظ التعديلات"
                  : "Save Changes"
                : isRtl
                ? "إنشاء الاختبار"
                : "Create Exam"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
