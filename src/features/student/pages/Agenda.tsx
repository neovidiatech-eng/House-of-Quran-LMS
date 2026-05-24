import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

import { useLanguage } from "../../../contexts/LanguageContext";
import { useStudentAgenda } from "../hooks/useStudentAgenda";
import { AgendaSession } from "../../../types/Agenda";
import SessionsDayModal from "../../../components/modals/SessionsDayModal";
import { formatDateLocal, getLocalDateKey } from "../../../utils/dateUtils";

export default function Agenda() {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const locale = language === "ar" ? "ar-EG" : "en-US";
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
    data: allSessions,
    isLoading,
    isError,
    error
  } = useStudentAgenda(startDate, endDate);

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, AgendaSession[]> = {};

    allSessions?.data.sessions.forEach((session) => {
      const dateKey = getLocalDateKey(session.start_time);

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(session);
    });

    return grouped;
  }, [allSessions]);

  // 📌 Stats
  const stats = useMemo(() => {
    return {
      total: allSessions?.data.count || 0,
      scheduled: allSessions?.data.sessions.filter((s) => s.status === "scheduled").length || 0,
      planned: allSessions?.data.sessions.filter((s) => s.status === "planned").length || 0,
      cancelled: allSessions?.data.sessions.filter((s) => s.status === "cancelled").length || 0,
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
  if (isError) {
    return <div className="p-10 text-center text-red-500">{error.message}</div>;
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
            {isLoading ? (
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
              <ChevronLeft className="w-5 h-5" />
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
              <ChevronRight className="w-5 h-5" />
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
                  {isLoading ? (
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
          <h3 className="text-xl font-bold flex items-center justify-end gap-2 mb-6">
            <span>{t("todaySessions")}</span>
            <Clock className="w-5 h-5 text-primary" />
          </h3>

          {isLoading ? (
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
              {todaySessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-primary-50 border rounded-xl p-4 text-right"
                >
                  <p className="font-bold">{s.title}</p>

                  <p className="text-sm text-gray-600">
                    {new Date(s.start_time).toLocaleTimeString()} -{" "}
                    {new Date(s.end_time).toLocaleTimeString()}
                  </p>

                  <p className="text-xs mt-1">{s.status}</p>

                  {s.link && (
                    <button
                      onClick={() => window.open(s.link, "_blank")}
                      className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm"
                    >
                      Join Session
                    </button>
                  )}
                </div>
              ))}
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
      />
    </div>
  );
}
