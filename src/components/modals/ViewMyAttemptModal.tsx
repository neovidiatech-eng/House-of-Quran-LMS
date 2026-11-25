import { useLanguage } from "../../contexts/LanguageContext";
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useMyAttempt } from "../../features/student/hooks/useExams";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  examTitle?: string;
}

export default function ViewMyAttemptModal({
  isOpen,
  onClose,
  examId,
  examTitle,
}: Props) {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const { data, isLoading, isError, refetch } = useMyAttempt(
    examId,
    isOpen && !!examId
  );

  if (!isOpen) return null;

  const attemptData = data?.data || data;
  const isPassed =
    attemptData?.passed ??
    (attemptData?.score && attemptData?.totalPoints
      ? attemptData.score >= (attemptData.passPoints || attemptData.totalPoints / 2)
      : false);

  const answersList =
    attemptData?.answers ||
    attemptData?.studentAnswers ||
    attemptData?.examQuestions ||
    [];

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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {isRtl ? "نتيجة وملاحظات الاختبار" : "Exam Result & Feedback"}
              </h2>
              {examTitle && (
                <p className="text-xs text-gray-500 mt-0.5">{examTitle}</p>
              )}
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
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-500">
                {isRtl ? "جاري تحميل تفاصيل المحاولة..." : "Loading attempt details..."}
              </p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {isRtl ? "تعذر تحميل نتيجة الاختبار" : "Failed to load result"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {isRtl
                  ? "قد لا تكون قد قدمت هذا الاختبار بعد أو حدث خطأ في الاتصال."
                  : "You might not have submitted this exam yet, or a network error occurred."}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                {isRtl ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : (
            <>
              {/* Score Banner */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/70 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isPassed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <XCircle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {isRtl ? "درجتك النهائية:" : "Your Final Score:"}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isPassed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isPassed
                          ? isRtl
                            ? "ناجح"
                            : "Passed"
                          : isRtl
                          ? "راسب"
                          : "Failed"}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-1">
                      {attemptData?.score ?? 0}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        / {attemptData?.totalPoints || attemptData?.exam?.totalPoints || 100}{" "}
                        {isRtl ? "درجة" : "points"}
                      </span>
                    </div>
                  </div>
                </div>

                {attemptData?.createdAt && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(attemptData.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Overall Teacher Feedback if present */}
              {(attemptData?.feedback || attemptData?.teacherFeedback) && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                    <span>{isRtl ? "ملاحظة المعلم العامة:" : "Teacher Feedback:"}</span>
                  </div>
                  <p className="text-sm text-amber-950 font-medium leading-relaxed">
                    "{attemptData.feedback || attemptData.teacherFeedback}"
                  </p>
                </div>
              )}

              {/* Detailed Questions & Answers List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {isRtl ? "تفاصيل الأسئلة والإجابات:" : "Questions & Answers Breakdown:"}
                </h4>

                {answersList.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    {isRtl
                      ? "لا تتوفر تفاصيل إضافية للأسئلة."
                      : "No additional question details available."}
                  </p>
                ) : (
                  answersList.map((item: any, idx: number) => {
                    const qText =
                      item.question?.question ||
                      item.questionText ||
                      item.question ||
                      (isRtl ? `سؤال ${idx + 1}` : `Question ${idx + 1}`);

                    const isEssay =
                      item.question?.type === "ESSAY" || !!item.textAnswer;

                    return (
                      <div
                        key={item.id || item.questionId || idx}
                        className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-gray-600">
                            {isRtl ? `السؤال ${idx + 1}` : `Question ${idx + 1}`}
                          </span>
                          {item.score !== undefined && (
                            <span className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800">
                              {isRtl ? "الدرجة:" : "Score:"} {item.score}{" "}
                              {item.question?.points && `/ ${item.question.points}`}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-900 whitespace-pre-line">
                          {qText}
                        </p>

                        {/* Student Answer */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-500">
                            {isRtl ? "إجابتك:" : "Your Answer:"}
                          </span>
                          <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 leading-relaxed">
                            {isEssay ? (
                              <p className="font-mono whitespace-pre-line">
                                {item.textAnswer || (
                                  <span className="text-gray-400 italic">
                                    {isRtl ? "لا توجد إجابة" : "No answer"}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <span>
                                {item.selectedOption?.option ||
                                  item.option?.option ||
                                  item.option ||
                                  (isRtl ? "إجابة محددة" : "Selected Option")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Specific Feedback */}
                        {item.feedback && (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 space-y-1">
                            <span className="font-bold flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                              {isRtl ? "ملاحظة المعلم:" : "Teacher Comment:"}
                            </span>
                            <p className="leading-relaxed">"{item.feedback}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
