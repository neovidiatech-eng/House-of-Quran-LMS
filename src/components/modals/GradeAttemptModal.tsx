import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  X,
  Award,
  CheckCircle2,
  FileText,
  User,
  MessageSquare,
  AlertCircle,
  Save,
} from "lucide-react";
import { StudentAttemptDetail, ExamQuestion } from "../../types/exam";
import { useGradeAttempt } from "../../features/teacher/hooks/useExams";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  attempt: StudentAttemptDetail | null;
  examQuestions?: ExamQuestion[];
  onSuccess?: () => void;
}

interface QuestionGradeInput {
  questionId: string;
  score: number;
  feedback: string;
}

export default function GradeAttemptModal({
  isOpen,
  onClose,
  examId,
  attempt,
  examQuestions = [],
  onSuccess,
}: Props) {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const gradeMutation = useGradeAttempt();

  const [grades, setGrades] = useState<Record<string, QuestionGradeInput>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Match questions with student answers
  const essayQuestionsWithAnswers = useMemo(() => {
    if (!attempt) return [];

    const answersList = attempt.answers || (attempt as any).studentAnswers || [];

    // If attempt has answers with questions embedded
    if (answersList.length > 0) {
      return answersList.map((ans: any) => {
        const qId = ans.questionId || ans.question?.id;
        const matchedQ =
          examQuestions.find((q) => q.id === qId) ||
          ans.question || {
            id: qId,
            question: ans.questionText || (isRtl ? "سؤال مقالي" : "Essay Question"),
            points: ans.points || 10,
            type: "ESSAY",
          };

        return {
          questionId: qId,
          question: matchedQ,
          textAnswer: ans.textAnswer || ans.answer || "",
          optionId: ans.optionId,
          currentScore: ans.score ?? 0,
          currentFeedback: ans.feedback || "",
        };
      });
    }

    // Fallback: use examQuestions directly
    return examQuestions.map((q) => {
      const qAns = answersList.find(
        (a: any) => (a.questionId || a.question?.id) === q.id
      );
      return {
        questionId: q.id || "",
        question: q,
        textAnswer: qAns?.textAnswer || qAns?.answer || "",
        optionId: qAns?.optionId,
        currentScore: qAns?.score ?? 0,
        currentFeedback: qAns?.feedback || "",
      };
    });
  }, [attempt, examQuestions, isRtl]);

  // Initialize grades state
  useEffect(() => {
    if (!isOpen || !attempt) {
      setGrades({});
      setOverallFeedback("");
      setErrorMsg(null);
      return;
    }

    const initialGrades: Record<string, QuestionGradeInput> = {};
    essayQuestionsWithAnswers.forEach((item) => {
      if (!item.questionId) return;
      initialGrades[item.questionId] = {
        questionId: item.questionId,
        score: item.currentScore ?? 0,
        feedback: item.currentFeedback || "",
      };
    });

    setGrades(initialGrades);
    setOverallFeedback(attempt.feedback || (attempt as any).teacherFeedback || "");
    setErrorMsg(null);
  }, [isOpen, attempt, essayQuestionsWithAnswers]);

  if (!isOpen || !attempt) return null;

  const handleScoreChange = (qId: string, value: string, maxPoints: number) => {
    const num = value === "" ? 0 : Math.max(0, Math.min(maxPoints, Number(value)));
    setGrades((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        score: num,
        feedback: prev[qId]?.feedback || "",
      },
    }));
  };

  const handleFeedbackChange = (qId: string, feedback: string) => {
    setGrades((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        score: prev[qId]?.score ?? 0,
        feedback,
      },
    }));
  };

  // Calculate total awarded score
  const totalAwarded = Object.values(grades).reduce(
    (sum, item) => sum + (Number(item.score) || 0),
    0
  );

  const handleSubmitGrades = async () => {
    if (!attempt.id || !examId) return;
    setErrorMsg(null);

    const formattedGrades = Object.values(grades).map((g) => ({
      questionId: g.questionId,
      score: Number(g.score) || 0,
      feedback: g.feedback ? g.feedback.trim() : undefined,
    }));

    try {
      await gradeMutation.mutateAsync({
        examId,
        attemptId: attempt.id,
        payload: {
          grades: formattedGrades,
          feedback: overallFeedback.trim() || undefined,
        },
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to grade attempt:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          (isRtl
            ? "حدث خطأ أثناء حفظ واعتماد الدرجات."
            : "Failed to submit grades. Please try again.")
      );
    }
  };

  const studentName =
    attempt.student?.user?.name ||
    attempt.student?.name ||
    (attempt as any).studentName ||
    (isRtl ? "طالب" : "Student");

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {isRtl ? "تصحيح محاولة الطالب" : "Grade Student Attempt"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                <span className="font-semibold text-gray-800">{studentName}</span>
                <span>•</span>
                <span>
                  {isRtl
                    ? `إجمالي الدرجات المرصودة: ${totalAwarded}`
                    : `Total Score: ${totalAwarded}`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student & Attempt Info Strip */}
          <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <User className="w-4 h-4 text-gray-400" />
              <span>{isRtl ? "الطالب:" : "Student:"}</span>
              <strong className="text-gray-900">{studentName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">{isRtl ? "حالة المحاولة:" : "Status:"}</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {attempt.status === "submitted"
                  ? isRtl
                    ? "بانتظار التصحيح"
                    : "Submitted"
                  : attempt.status || (isRtl ? "مقدمة" : "Submitted")}
              </span>
            </div>
          </div>

          {/* Questions to Grade */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {isRtl
                ? "الأسئلة وإجابات الطالب المقالية:"
                : "Questions & Student Written Answers:"}
            </h3>

            {essayQuestionsWithAnswers.length === 0 ? (
              <div className="py-8 text-center text-gray-400 border border-dashed rounded-xl">
                {isRtl
                  ? "لا توجد أسئلة مقالية مسجلة لهذه المحاولة."
                  : "No essay questions found in this attempt."}
              </div>
            ) : (
              essayQuestionsWithAnswers.map((item, idx) => {
                const qId = item.questionId;
                const maxPoints = item.question?.points || 10;
                const currentVal = grades[qId] || { score: 0, feedback: "" };

                return (
                  <div
                    key={qId || idx}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-gray-300"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-800">
                        {isRtl ? `سؤال ${idx + 1}` : `Question ${idx + 1}`}
                      </span>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                        {isRtl
                          ? `الدرجة القصوى: ${maxPoints}`
                          : `Max: ${maxPoints} pts`}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="text-sm font-semibold text-gray-900 bg-gray-50/70 p-3 rounded-xl border border-gray-100 whitespace-pre-line">
                      {item.question?.question}
                    </p>

                    {/* Student's text answer */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">
                        {isRtl ? "إجابة الطالب:" : "Student Answer:"}
                      </label>
                      <div className="p-3.5 bg-blue-50/50 border border-blue-200/70 rounded-xl text-sm text-gray-900 leading-relaxed font-mono whitespace-pre-line">
                        {item.textAnswer || (
                          <span className="text-gray-400 italic">
                            {isRtl ? "لم يتم تقديم إجابة نصية" : "No answer text"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Grading Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      {/* Score Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">
                          {isRtl ? "الدرجة المستحقة:" : "Awarded Score:"}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={maxPoints}
                            value={currentVal.score}
                            onChange={(e) =>
                              handleScoreChange(qId, e.target.value, maxPoints)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                            / {maxPoints}
                          </span>
                        </div>
                      </div>

                      {/* Question Feedback Input */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-700">
                          {isRtl ? "ملاحظة المعلم على السؤال:" : "Question Feedback:"}
                        </label>
                        <input
                          type="text"
                          value={currentVal.feedback}
                          onChange={(e) =>
                            handleFeedbackChange(qId, e.target.value)
                          }
                          placeholder={
                            isRtl
                              ? "مثال: المقارنة دقيقة ومستوفية للشروط"
                              : "e.g. Well explained and complete"
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Overall General Feedback */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <MessageSquare className="w-4 h-4 text-primary" />
              {isRtl
                ? "ملاحظة المعلم العامة على المحاولة:"
                : "Overall Attempt Feedback:"}
            </label>
            <textarea
              rows={3}
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder={
                isRtl
                  ? "مثال: مجهود رائع ومبارك، وفقك الله دائماً"
                  : "e.g. Great effort and dedication, keep it up!"
              }
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 text-sm transition-colors"
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleSubmitGrades}
            disabled={gradeMutation.isPending}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {gradeMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isRtl ? "حفظ واعتماد الدرجات" : "Save & Grade Attempt"}
          </button>
        </div>
      </div>
    </div>
  );
}
