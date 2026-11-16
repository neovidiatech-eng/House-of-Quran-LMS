import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Calendar, Clock, ChevronDown, ChevronUp, Star } from "lucide-react";
import { AgendaSession } from "../../types/Agenda";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  sessions: AgendaSession[];
  studentMap?: Map<string, string>;
  teacherMap?: Map<string, string>;
}

const getPersonName = (person: any, id?: string, idMap?: Map<string, string>): string => {
  if (id && idMap && idMap.has(id)) {
    return idMap.get(id)!;
  }
  if (!person) return "-";
  if (typeof person === "string") return person;
  if (typeof person === "object") {
    if (person.user?.name) return person.user.name;
    if (person.name) return person.name;
    if (person.name_ar) return person.name_ar;
    if (person.name_en) return person.name_en;
    if (person.email) return person.email;
  }
  return "-";
};

const getStatusBadge = (status?: string, language: string = "ar") => {
  const s = status?.toLowerCase();
  const isAr = language.startsWith("ar");
  switch (s) {
    case "scheduled":
      return { label: isAr ? "مجدولة" : "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" };
    case "planned":
      return { label: isAr ? "مخطط لها" : "Planned", className: "bg-purple-50 text-purple-700 border-purple-200" };
    case "completed":
      return { label: isAr ? "مكتملة" : "Completed", className: "bg-green-50 text-green-700 border-green-200" };
    case "cancelled":
    case "canceled":
      return { label: isAr ? "ملغاة" : "Cancelled", className: "bg-red-50 text-red-700 border-red-200" };
    default:
      return { label: status || "-", className: "bg-gray-100 text-gray-700 border-gray-200" };
  }
};

interface PersonReviewRowProps {
  label: string;
  name: string;
  review?: {
    rating: number | string;
    comment: string;
    role?: string;
  } | null;
  language: string;
}

function PersonReviewRow({ label, name, review, language }: PersonReviewRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100/80 last:border-0 pb-1.5 last:pb-0">
      <div
        onClick={() => review && setIsOpen((prev) => !prev)}
        className={`flex justify-between items-center py-1.5 px-2 rounded-lg transition-all ${review ? 'cursor-pointer hover:bg-gray-100/70 select-none' : ''
          }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 font-semibold">{label}:</span>
          <span className="font-medium text-gray-800">{name}</span>
          {review && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200/80 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {review.rating}
            </span>
          )}
        </div>

        {review && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              {isOpen ? (language === 'ar' ? 'إخفاء التقييم' : 'Hide Review') : (language === 'ar' ? 'عرض التقييم' : 'View Review')}
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {review && isOpen && (
        <div className="mt-1 mx-1 p-3 bg-white rounded-xl border border-gray-200/80 shadow-lg space-y-2 text-xs transition-all animate-in fade-in duration-200">
          {review.comment && (
            <div className="flex items-start gap-2 pt-1.5">
              <p className="text-gray-700 font-medium leading-relaxed bg-gray-100/100 p-2.5 rounded-lg w-full border border-gray-100">
                {review.comment}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionsDayModal({
  isOpen,
  onClose,
  date,
  sessions,
  studentMap,
  teacherMap,
}: Props) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* HEADER */}
        <div className="sticky top-0 bg-primary text-white flex justify-between items-center px-6 py-4 rounded-t-2xl z-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {language === 'ar' ? `حصص يوم - ${date}` : `Sessions - ${date}`}
          </h2>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              {language === 'ar' ? 'لا توجد حصص في هذا اليوم' : 'No sessions found'}
            </p>
          ) : (
            sessions.map((s) => {
              const teacherName = getPersonName(s.teacher, s.teacherId, teacherMap);
              const studentName = getPersonName(s.student, s.studentId, studentMap);
              const badge = getStatusBadge(s.status, language);

              const teacherReview = s.reviews?.find(
                (r) => r.role === 'teacher' || r.reviewerId === s.teacherId
              );
              const studentReview = s.reviews?.find(
                (r) => r.role === 'student' || r.reviewerId === s.studentId
              );

              // Fallback if role/reviewerId wasn't explicitly set
              const fallbackReview = s.reviews?.[0];
              const effectiveTeacherReview = teacherReview || (!studentReview ? fallbackReview : null);

              return (
                <div key={s.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">{s.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  {s.description && <p className="text-sm text-gray-600">{s.description}</p>}

                  <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-200">
                    <PersonReviewRow
                      label={language === 'ar' ? 'المعلم' : 'Teacher'}
                      name={teacherName}
                      review={effectiveTeacherReview}
                      language={language}
                    />
                    <PersonReviewRow
                      label={language === 'ar' ? 'الطالب' : 'Student'}
                      name={studentName}
                      review={studentReview}
                      language={language}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-gray-200">
                    <Clock className="w-4 h-4 text-primary" />
                    <span dir="ltr">
                      {s.display_start_time && s.display_end_time
                        ? `${s.display_start_time} - ${s.display_end_time}`
                        : `${new Date(s.start_time).toLocaleTimeString()} - ${new Date(s.end_time).toLocaleTimeString()}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
