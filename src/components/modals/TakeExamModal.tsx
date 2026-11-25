import { useState, useEffect, useMemo, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Send,
  X,
  Award,
  HelpCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Exam, ExamQuestion } from "../../types/exam";
import { useStartExam, useSubmitExam } from "../../features/student/hooks/useExams";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onSuccess?: () => void;
}

interface AnswerState {
  optionId?: string;
  textAnswer?: string;
}

export default function TakeExamModal({
  isOpen,
  onClose,
  exam,
  onSuccess,
}: Props) {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const startExamMutation = useStartExam();
  const submitExamMutation = useSubmitExam();

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and start exam
  useEffect(() => {
    if (!isOpen || !exam?.id) {
      // Reset state on close
      setQuestions([]);
      setCurrentQIndex(0);
      setAnswers({});
      setTimeLeft(null);
      setIsSubmitting(false);
      setSubmittedResult(null);
      setShowConfirmSubmit(false);
      setStartError(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const initExam = async () => {
      setStartError(null);
      try {
        const res = await startExamMutation.mutateAsync(exam.id);
        const data = res?.data || res;

        // Extract questions safely
        const rawQuestions =
          data?.questions ||
          data?.examQuestions ||
          data?.exam?.questions ||
          data?.exam?.examQuestions ||
          exam.questions ||
          exam.examQuestions ||
          [];

        setQuestions(rawQuestions);

        // Calculate time left (in seconds)
        let durationMinutes =
          data?.remainingMinutes ||
          (data?.remainingTime && data.remainingTime > 120
            ? Math.round(data.remainingTime / 60)
            : data?.remainingTime) ||
          data?.duration ||
          exam.duration ||
          30;

        // If remainingTime was sent in seconds already:
        let initialSeconds = durationMinutes * 60;
        if (data?.remainingSeconds) {
          initialSeconds = data.remainingSeconds;
        } else if (data?.remainingTime && data.remainingTime > 600) {
          initialSeconds = data.remainingTime;
        }

        setTimeLeft(initialSeconds);
      } catch (err: any) {
        console.error("Failed to start exam:", err);
        // Fallback to questions attached to exam if any
        const fallbackQs = exam.questions || exam.examQuestions || [];
        if (fallbackQs.length > 0) {
          setQuestions(fallbackQs);
          setTimeLeft((exam.duration || 30) * 60);
        } else {
          setStartError(
            err?.response?.data?.message ||
              (isRtl
                ? "فشل في بدء الامتحان أو تحميل الأسئلة. يرجى المحاولة مرة أخرى."
                : "Failed to start the exam. Please try again.")
          );
        }
      }
    };

    initExam();
  }, [isOpen, exam?.id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submittedResult || isSubmitting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto submit when time runs out
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submittedResult, isSubmitting]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Answer handler
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        optionId,
      },
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        textAnswer: text,
      },
    }));
  };

  // Submit implementation
  const performSubmit = async () => {
    if (!exam?.id || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      // Build answers array matching the Apidog docs
      const formattedAnswers = questions
        .map((q) => {
          const qId = q.id || "";
          const userAns = answers[qId];

          if (q.type === "ESSAY") {
            const text = userAns?.textAnswer?.trim();
            if (text) {
              return {
                questionId: qId,
                textAnswer: text,
              };
            }
          } else {
            if (userAns?.optionId) {
              return {
                questionId: qId,
                optionId: userAns.optionId,
              };
            }
          }
          return null;
        })
        .filter((item): item is { questionId: string; optionId?: string; textAnswer?: string } => item !== null);

      const res = await submitExamMutation.mutateAsync({
        examId: exam.id,
        payload: { answers: formattedAnswers },
      });

      setSubmittedResult(res?.data || res || { success: true });
      if (timerRef.current) clearInterval(timerRef.current);
      onSuccess?.();
    } catch (err: any) {
      console.error("Submit exam error:", err);
      alert(
        err?.response?.data?.message ||
          (isRtl ? "حدث خطأ أثناء تسليم الاختبار" : "Error submitting exam")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    performSubmit();
  };

  // Total answered questions
  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const qId = q.id || "";
      const ans = answers[qId];
      if (q.type === "ESSAY") {
        return !!ans?.textAnswer && ans.textAnswer.trim().length > 0;
      }
      return !!ans?.optionId;
    }).length;
  }, [questions, answers]);

  if (!isOpen) return null;

  const currentQ = questions[currentQIndex];
  const isLastQuestion = currentQIndex === questions.length - 1;
  const isFirstQuestion = currentQIndex === 0;
  const isTimeLow = timeLeft !== null && timeLeft <= 300; // less than 5 min

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {exam?.title || (isRtl ? "أداء الاختبار" : "Take Exam")}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{exam?.subject?.name_ar || exam?.subject?.name_en || ""}</span>
                {questions.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {isRtl
                        ? `${questions.length} أسئلة`
                        : `${questions.length} questions`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timer Clock */}
            {timeLeft !== null && !submittedResult && (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold border transition-colors ${
                  isTimeLow
                    ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono tracking-wider">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            {!submittedResult && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      isRtl
                        ? "هل أنت متأكد من رغبتك في إغلاق الاختبار؟ لن يتم حفظ إجاباتك غير المسلمة."
                        : "Are you sure you want to exit? Your unsaved answers will be lost."
                    )
                  ) {
                    onClose();
                  }
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                title={isRtl ? "خروج" : "Exit"}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. Loading State */}
          {startExamMutation.isPending && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-800">
                {isRtl
                  ? "جاري تجهيز الاختبار وبدء المحاولة..."
                  : "Preparing exam and starting session..."}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isRtl ? "يرجى الانتظار لحظات" : "Please wait a moment"}
              </p>
            </div>
          )}

          {/* 2. Start Error State */}
          {startError && !startExamMutation.isPending && (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isRtl ? "تعذر بدء الاختبار" : "Could not start exam"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{startError}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => onClose()}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                >
                  {isRtl ? "إغلاق" : "Close"}
                </button>
                <button
                  onClick={() => {
                    setStartError(null);
                    if (exam?.id) startExamMutation.mutate(exam.id);
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isRtl ? "إعادة المحاولة" : "Retry"}
                </button>
              </div>
            </div>
          )}

          {/* 3. Submitted / Result State */}
          {submittedResult && (
            <div className="py-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isRtl ? "تم تسليم الاختبار بنجاح!" : "Exam Submitted Successfully!"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {submittedResult?.score !== undefined ||
                submittedResult?.data?.score !== undefined ? (
                  isRtl ? (
                    <span>
                      تم احتساب درجتك الفورية:{" "}
                      <strong className="text-emerald-700 font-bold text-base">
                        {submittedResult?.score ?? submittedResult?.data?.score}
                      </strong>{" "}
                      من{" "}
                      <strong>
                        {submittedResult?.totalPoints ??
                          submittedResult?.data?.totalPoints ??
                          exam?.totalPoints}
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Your score:{" "}
                      <strong>
                        {submittedResult?.score ?? submittedResult?.data?.score}
                      </strong>{" "}
                      /{" "}
                      {submittedResult?.totalPoints ??
                        submittedResult?.data?.totalPoints ??
                        exam?.totalPoints}
                    </span>
                  )
                ) : (
                  isRtl
                    ? "تم استلام إجاباتك بنجاح، وبانتظار مراجعة وتصحيح المعلم للأسئلة."
                    : "Your answers have been submitted and are pending teacher review."
                )}
              </p>

              {/* Summary details card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-start space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {isRtl ? "عدد الأسئلة المجابة" : "Answered Questions"}:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {answeredCount} / {questions.length}
                  </span>
                </div>
                {(submittedResult?.passed !== undefined ||
                  submittedResult?.data?.passed !== undefined) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {isRtl ? "النتيجة" : "Result"}:
                    </span>
                    <span
                      className={`font-bold ${
                        (submittedResult?.passed ??
                        submittedResult?.data?.passed)
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {(submittedResult?.passed ?? submittedResult?.data?.passed)
                        ? isRtl
                          ? "ناجح"
                          : "Passed"
                        : isRtl
                        ? "راسب"
                        : "Failed"}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSuccess?.();
                }}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {isRtl ? "العودة إلى الامتحانات" : "Back to Exams"}
              </button>
            </div>
          )}

          {/* 4. Active Questions View */}
          {!startExamMutation.isPending &&
            !startError &&
            !submittedResult &&
            questions.length > 0 &&
            currentQ && (
              <div className="space-y-6">
                {/* Progress bar & Question navigation pills */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">
                      {isRtl
                        ? `السؤال ${currentQIndex + 1} من ${questions.length}`
                        : `Question ${currentQIndex + 1} of ${questions.length}`}
                    </span>
                    <span className="font-medium text-primary">
                      {isRtl
                        ? `تمت الإجابة على ${answeredCount} من ${questions.length}`
                        : `${answeredCount} of ${questions.length} answered`}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${(answeredCount / questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Question Pills Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
                    {questions.map((q, idx) => {
                      const qId = q.id || "";
                      const isAnswered =
                        q.type === "ESSAY"
                          ? !!answers[qId]?.textAnswer?.trim()
                          : !!answers[qId]?.optionId;
                      const isCurrent = idx === currentQIndex;

                      return (
                        <button
                          key={q.id || idx}
                          type="button"
                          onClick={() => setCurrentQIndex(idx)}
                          className={`min-w-[34px] h-[34px] rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                            isCurrent
                              ? "bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-1"
                              : isAnswered
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-6">
                  {/* Question Header info */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-700">
                      <HelpCircle className="w-3.5 h-3.5 text-primary" />
                      {currentQ.type === "MCQ"
                        ? isRtl
                          ? "اختيار من متعدد"
                          : "Multiple Choice"
                        : currentQ.type === "TRUE_FALSE"
                        ? isRtl
                          ? "صح أو خطأ"
                          : "True / False"
                        : isRtl
                        ? "سؤال مقالي"
                        : "Essay Question"}
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Award className="w-3.5 h-3.5" />
                      {currentQ.points}{" "}
                      {isRtl ? "درجات" : "points"}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed mb-6 whitespace-pre-line">
                    {currentQ.question}
                  </h3>

                  {/* Options: MCQ or TRUE_FALSE */}
                  {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
                    <div className="space-y-3">
                      {((currentQ.options || currentQ.examQuestionOptions) || []).map(
                        (opt, optIdx) => {
                          const optId = opt.id || String(optIdx);
                          const isSelected =
                            answers[currentQ.id || ""]?.optionId === optId;

                          return (
                            <div
                              key={optId}
                              onClick={() =>
                                handleSelectOption(currentQ.id || "", optId)
                              }
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-primary/5 border-primary shadow-sm"
                                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "border-primary bg-primary text-white"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span
                                  className={`text-sm md:text-base ${
                                    isSelected
                                      ? "font-bold text-gray-900"
                                      : "font-medium text-gray-700"
                                  }`}
                                >
                                  {opt.option}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Essay input */}
                  {currentQ.type === "ESSAY" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-500">
                        {isRtl
                          ? "اكتب إجابتك بالتفصيل هنا:"
                          : "Type your detailed answer here:"}
                      </label>
                      <textarea
                        rows={6}
                        value={answers[currentQ.id || ""]?.textAnswer || ""}
                        onChange={(e) =>
                          handleTextAnswerChange(
                            currentQ.id || "",
                            e.target.value
                          )
                        }
                        placeholder={
                          isRtl
                            ? "اكتب الإجابة النموذجية للسؤال المقالي..."
                            : "Enter your answer here..."
                        }
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white leading-relaxed resize-none text-sm md:text-base"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 5. Empty questions fallback */}
          {!startExamMutation.isPending &&
            !startError &&
            !submittedResult &&
            questions.length === 0 && (
              <div className="py-16 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800">
                  {isRtl ? "لا توجد أسئلة مضافة لهذا الاختبار" : "No questions in this exam"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isRtl
                    ? "يرجى مراجعة المعلم المسؤول عن المادة."
                    : "Please consult with the teacher."}
                </p>
              </div>
            )}
        </div>

        {/* Modal Footer Controls */}
        {!submittedResult && !startError && questions.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            {/* Previous button */}
            <button
              type="button"
              disabled={isFirstQuestion}
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors ${
                isFirstQuestion
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {isRtl ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </>
              )}
            </button>

            {/* Middle: Actions */}
            <div className="flex items-center gap-3">
              {/* Submit Button */}
              <button
                type="button"
                onClick={() => {
                  if (answeredCount < questions.length) {
                    setShowConfirmSubmit(true);
                  } else {
                    performSubmit();
                  }
                }}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isRtl ? "تسليم الاختبار" : "Submit Exam"}
              </button>

              {/* Next Button */}
              {!isLastQuestion && (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
                >
                  {isRtl ? (
                    <>
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal overlay when submitting with unanswered questions */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                {isRtl ? "تأكيد تسليم الاختبار" : "Confirm Exam Submission"}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                {isRtl ? (
                  <>
                    لديك{" "}
                    <strong className="text-amber-600">
                      {questions.length - answeredCount} أسئلة
                    </strong>{" "}
                    لم يتم الإجابة عليها بعد. هل أنت متأكد من رغبتك في التسليم
                    الآن؟
                  </>
                ) : (
                  <>
                    You have{" "}
                    <strong>{questions.length - answeredCount} unanswered</strong>{" "}
                    questions. Are you sure you want to submit now?
                  </>
                )}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                >
                  {isRtl ? "متابعة الإجابة" : "Continue Answering"}
                </button>
                <button
                  type="button"
                  onClick={performSubmit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-emerald-600/20"
                >
                  {isRtl ? "نعم، تسليم الآن" : "Yes, Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
