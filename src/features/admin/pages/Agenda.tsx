import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

import { useLanguage } from "../../../contexts/LanguageContext";
import { useAgenda } from "../../admin/hooks/useAgenda";
import { useStudents } from "../../admin/hooks/useStudents";
import { useTeacher } from "../../admin/hooks/useTeacher";
import { AgendaSession } from "../../../types/Agenda";
import SessionsDayModal from "../../../components/modals/SessionsDayModal";
import { formatDateLocal, getLocalDateKey } from "../../../utils/dateUtils";

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

export default function Agenda() {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const locale = language === "ar" ? "ar-EG" : "en-US";

  const { data: studentsResponse } = useStudents({ limit: 1000 });
  const { data: teachersResponse } = useTeacher({ limit: 100 });

  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    const studentsList = studentsResponse?.data?.studentsData || (studentsResponse as any)?.data?.students || [];
    studentsList.forEach((s: any) => {
      if (s.id && s.user?.name) map.set(s.id, s.user.name);
      if (s.user_id && s.user?.name) map.set(s.user_id, s.user.name);
    });
    return map;
  }, [studentsResponse]);

  const teacherMap = useMemo(() => {
    const map = new Map<string, string>();
    const teachersList = teachersResponse?.teachers || (teachersResponse as any)?.data?.teachers || [];
    teachersList.forEach((t: any) => {
      if (t.id && t.user?.name) map.set(t.id, t.user.name);
      if (t.user_id && t.user?.name) map.set(t.user_id, t.user.name);
    });
    return map;
  }, [teachersResponse]);
  // 📌 Month range
  const startDate = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return formatDateLocal(d);
  }, [currentDate]);

  const endDate = useMemo(() => {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return formatDateLocal(d);
  }, [currentDate]);

  const {
    sessions: allSessions,
    loading,
    error,
  } = useAgenda(startDate, endDate);

  // 📌 Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, AgendaSession[]> = {};

    allSessions.forEach((session) => {
      const dateKey = getLocalDateKey(session.start_time);

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(session);
    });

    return grouped;
  }, [allSessions]);

  // 📌 Stats
  const stats = useMemo(() => {
    return {
      total: allSessions.length,
      scheduled: allSessions.filter((s) => s.status === "scheduled").length,
      planned: allSessions.filter((s) => s.status === "planned").length,
      cancelled: allSessions.filter((s) => s.status === "cancelled").length,
    };
  }, [allSessions]);

  const weekDays = [
    t("sun"),
    t("mon"),
    t("tue"),
    t("wed"),
    t("thu"),
    t("fri"),
    t("sat"),
  ];

  const formatKey = (date: Date) => formatDateLocal(date);

  // 📌 Build calendar days
  const getDaysInMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), d));
    }

    return days;
  };

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  const days = getDaysInMonth(currentDate);

  const todayKey = formatDateLocal(new Date());
  const todaySessions = sessionsByDate[todayKey] || [];

  // 📌 Error
  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-primary rounded-2xl p-8 text-white flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold mb-2">{t("sessionCalendar")}</h1>
          <p className="text-blue-100">{t("sessionCalendarSubtitle")}</p>
        </div>

        <div className="p-4 bg-white/20 rounded-2xl">
          <CalendarIcon className="w-12 h-12" />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t("totalSessions"), val: stats.total },
          { label: t("scheduled"), val: stats.scheduled },
          { label: t("planned"), val: stats.planned },
          { label: t("cancelled"), val: stats.cancelled },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border-r-4 border-gray-200 relative overflow-hidden"
          >
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 ml-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 text-right mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 text-right">
                  {s.val}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* CALENDAR + TODAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* HEADER */}
          <div className="bg-primary p-6 flex items-center justify-between">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="p-2 bg-white/20 rounded-lg text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white">
              {currentDate.toLocaleString(locale, { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </h2>

            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="p-2 bg-white/20 rounded-lg text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* WEEK DAYS */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {weekDays.map((d, i) => (
              <div key={i} className="p-4 text-center text-sm font-semibold">
                {d}
              </div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7">
            {days.map((d, i) =>
              !d ? (
                <div key={i} className="aspect-square border bg-gray-50" />
              ) : (
                <div
                  key={i}
                  className={`aspect-square border p-2 ${isToday(d)
                      ? "bg-green-50 border-green-300"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div className="text-sm font-medium">{d.getDate()}</div>

                  {/* CLICKABLE BADGE */}
                  {loading ? (
                    <div className="mt-2 flex justify-center w-full animate-pulse">
                      <div className="bg-gray-200 rounded-full w-6 h-6"></div>
                    </div>
                  ) : sessionsByDate[formatKey(d)]?.length > 0 && (
                    <button
                      onClick={() => {
                        const key = formatKey(d);
                        setSelectedDate(key);
                        setModalOpen(true);
                      }}
                      className="mt-2 flex justify-center w-full"
                    >
                      <div className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {sessionsByDate[formatKey(d)].length}
                      </div>
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* TODAY PANEL */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-xl font-bold flex items-center justify-between mb-6">
            <span className="text-xs bg-[#eefcfc] text-[#00a8a8] px-3 py-1 rounded-full font-bold">
              {todaySessions.length} حصص
            </span>
            <span className="flex items-center gap-2">
              <span>{t("todaySessions")}</span>
              <Clock className="w-5 h-5 text-primary" />
            </span>
          </h3>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 border rounded-xl p-4 h-28"></div>
              ))}
            </div>
          ) : todaySessions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              {t("noSessionsToday")}
            </p>
          ) : (
            <div className="space-y-4">
              {todaySessions.map((s) => {
                const teacherName = getPersonName(s.teacher, s.teacherId, teacherMap);
                const studentName = getPersonName(s.student, s.studentId, studentMap);
                const badge = getStatusBadge(s.status, language);

                return (
                  <div
                    key={s.id}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-right space-y-2 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${badge.className}`}>
                        {badge.label}
                      </span>
                      {/* {s.title && <p className="font-bold text-gray-900 text-base">{s.title}</p>} */}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold">{t("teacher_label") || (language === 'ar' ? ' المعلم:  ' : 'Teacher :')}</span>
                        <span className="font-medium text-gray-800">{teacherName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold">{t("student_label") || (language === 'ar' ? '  الطالب: ' : 'Student:')}</span>
                        <span className="font-medium text-gray-800">{studentName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 text-xs text-teal-700 font-semibold pt-1">
                      <span dir="ltr">
                        {s.display_start_time && s.display_end_time
                          ? `${s.display_start_time} - ${s.display_end_time}`
                          : `${new Date(s.start_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.end_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                      <Clock className="w-3.5 h-3.5 text-[#00a8a8]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <SessionsDayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedDate}
        sessions={selectedDate ? sessionsByDate[selectedDate] || [] : []}
        studentMap={studentMap}
        teacherMap={teacherMap}
      />
    </div>
  );
}
