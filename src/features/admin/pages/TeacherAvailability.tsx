import { useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Calendar,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import CustomSelect from "../../../components/ui/CustomSelect";
import { mapTeachersToSessions } from "../../../utils/teacherMapper";
import { useTeacherAvailability } from "../hooks/useTeacherAvailabilty";

const DAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8;
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return { value: hour, label: `${display}:00 ${suffix}` };
});

function getWeekDates(weekOffset: number): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  startOfWeek.setDate(today.getDate() - day + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function getMonthDates(monthOffset: number): Date[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + monthOffset;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: Date[] = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

interface SessionData {
  id: string;
  sessionName: string;
  studentName: string;
  teacherName: string;
  teacherId: string;
  subject: string;
  day: string;
  date: string;
  time: string;
  endTime: string;
  meetingLink?: string;
  status?: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  color: string;
}

interface TeacherDetailModalProps {
  teacher: Teacher;
  sessions: SessionData[];
  onClose: () => void;
  language: "ar" | "en";
}

function TeacherDetailModal({
  teacher,
  sessions,
  onClose,
  language,
}: TeacherDetailModalProps) {
  const [tab, setTab] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const monthDates = getMonthDates(monthOffset);
  const DAYS = language === "ar" ? DAYS_AR : DAYS_EN;

  // const teacherSessions = sessions.filter(
  //   (s) => s.teacherName === teacher.name,
  // );
  const teacherSessions = sessions.filter((s) => s.teacherId === teacher.id);

  const weekSessions = teacherSessions.filter((s) =>
    weekDates.some((d) => formatDate(d) === s.date),
  );

  const monthName = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + monthOffset,
    1,
  ).toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    { month: "long", year: "numeric" },
  );

  const uniqueStudents = [
    ...new Set(teacherSessions.map((s) => s.studentName)),
  ];

  const isTeacherBusy = (date: Date, hour: number): boolean => {
    const dateStr = formatDate(date);
    return teacherSessions.some((slot) => {
      if (slot.date !== dateStr) return false;
      const start = parseTime(slot.time);
      const end = parseTime(slot.endTime);
      return hour >= start && hour < end;
    });
  };

  const getSlotInfo = (date: Date, hour: number) => {
    const dateStr = formatDate(date);
    return teacherSessions.find((slot) => {
      if (slot.date !== dateStr) return false;
      const start = parseTime(slot.time);
      const end = parseTime(slot.endTime);
      return hour >= start && hour < end;
    });
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return teacherSessions.filter((s) => s.date === dateStr);
  };

  const today = formatDate(new Date());

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${teacher.color} px-6 py-5 flex items-center justify-between`}
        >
          <button
            onClick={onClose}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-start">
              <h2 className="text-xl font-bold text-white">{teacher.name}</h2>
              <p className="text-white text-opacity-80 text-sm">
                {teacher.subject}
              </p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {teacher.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
            <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {language === "ar" ? "هذا الأسبوع" : "This Week"}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {weekSessions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {language === "ar" ? "إجمالي الحصص" : "Total Sessions"}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {teacherSessions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {language === "ar" ? "الطلاب" : "Students"}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {uniqueStudents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setTab("week")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === "week" ? "tab-active" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {language === "ar" ? "الجدول الأسبوعي" : "Weekly Schedule"}
          </button>
          <button
            onClick={() => setTab("month")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === "month" ? "tab-active" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {language === "ar" ? "الجدول الشهري" : "Monthly Schedule"}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {tab === "week" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-200 border border-red-300 inline-block" />
                    {language === "ar" ? "مشغول" : "Busy"}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" />
                    {language === "ar" ? "متاح" : "Free"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
                  <button
                    onClick={() => setWeekOffset((w) => w - 1)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-800 px-2">
                    {weekDates[0].toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {weekDates[6].toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {weekSessions.length > 0 && (
                <div className="mb-4 bg-primary-light border border-primary rounded-xl p-4">
                  <p className="text-sm font-semibold text-primary mb-2">
                    {language === "ar"
                      ? "حصص هذا الأسبوع"
                      : "This Week Sessions"}
                  </p>
                  <div className="space-y-2">
                    {weekSessions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-primary"
                      >
                        <span className="text-xs text-gray-500">
                          {s.time} - {s.endTime}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs badge-primary px-2 py-0.5 rounded-full">
                            {s.subject}
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {s.studentName}
                          </span>
                          <span className="text-sm text-gray-500">{s.day}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2.5 text-start text-gray-600 font-medium w-20 sticky right-0 bg-gray-50 border-l border-gray-200">
                        {language === "ar" ? "الوقت" : "Time"}
                      </th>
                      {weekDates.map((date, idx) => {
                        const isToday = formatDate(date) === today;
                        return (
                          <th
                            key={idx}
                            className={`px-2 py-2.5 text-center font-medium min-w-[90px] ${isToday ? "bg-primary-light text-primary" : "text-gray-600"}`}
                          >
                            <div>{DAYS[date.getDay()]}</div>
                            <div
                              className={`font-normal text-xs ${isToday ? "text-primary" : "text-gray-400"}`}
                            >
                              {date.getDate()}/{date.getMonth() + 1}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map((hour) => (
                      <tr
                        key={hour.value}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-1.5 text-start text-gray-500 whitespace-nowrap sticky right-0 bg-white border-l border-gray-200">
                          {hour.label}
                        </td>
                        {weekDates.map((date, idx) => {
                          const busy = isTeacherBusy(date, hour.value);
                          const info = busy
                            ? getSlotInfo(date, hour.value)
                            : null;
                          const isToday = formatDate(date) === today;
                          return (
                            <td
                              key={idx}
                              className={`px-1 py-1 text-center ${isToday ? "bg-primary-light" : ""}`}
                            >
                              {busy && info ? (
                                <div className="bg-red-100 border border-red-200 rounded-md px-1 py-1 group relative cursor-default">
                                  <div className="flex items-center justify-center gap-1">
                                    <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                    <span className="text-red-700 text-xs font-medium truncate max-w-[60px]">
                                      {info.studentName.split(" ")[0]}
                                    </span>
                                  </div>
                                  <div className="absolute z-10 bottom-full right-0 mb-1 bg-gray-900 text-white text-xs rounded-lg p-2.5 w-44 hidden group-hover:block shadow-lg">
                                    <p className="font-medium mb-1">
                                      {info.studentName}
                                    </p>
                                    <p className="text-gray-300 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {info.time} - {info.endTime}
                                    </p>
                                    <p className="text-gray-300 flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      {info.subject}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-green-50 border border-green-100 rounded-md py-1 flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-700">
                  {monthName}
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
                  <button
                    onClick={() => setMonthOffset((m) => m - 1)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-800 px-2">
                    {monthName}
                  </span>
                  <button
                    onClick={() => setMonthOffset((m) => m + 1)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_AR.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-medium text-gray-500 py-1"
                  >
                    {d.slice(0, 3)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from(
                  { length: new Date(monthDates[0]).getDay() },
                  (_, i) => (
                    <div key={`empty-${i}`} />
                  ),
                )}
                {monthDates.map((date) => {
                  const daySessions = getSessionsForDate(date);
                  const isToday = formatDate(date) === today;
                  const hasSessions = daySessions.length > 0;
                  return (
                    <div
                      key={formatDate(date)}
                      className={`relative rounded-xl p-1.5 min-h-[60px] border transition-all ${isToday
                          ? "bg-primary-light border-primary"
                          : hasSessions
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <span
                        className={`text-xs font-medium block text-center mb-1 ${isToday ? "text-primary" : hasSessions ? "text-red-700" : "text-gray-500"}`}
                      >
                        {date.getDate()}
                      </span>
                      {daySessions.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="text-xs bg-red-200 text-red-800 rounded px-1 py-0.5 truncate mb-0.5"
                          title={`${s.studentName} - ${s.time}`}
                        >
                          {s.studentName.split(" ")[0]}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <span className="text-xs text-red-600 font-medium">
                          +{daySessions.length - 2}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {uniqueStudents.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    {language === "ar"
                      ? "الطلاب المسجلون مع هذا المعلم"
                      : "Enrolled Students"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {uniqueStudents.map((studentName) => {
                      const studentSessions = teacherSessions.filter(
                        (s) => s.studentName === studentName,
                      );
                      return (
                        <div
                          key={studentName}
                          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5"
                        >
                          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-xs font-bold">
                              {studentName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {studentName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {studentSessions.length}{" "}
                              {language === "ar" ? "حصة" : "sessions"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherAvailability() {
  const { language } = useLanguage();
  // const { sessions } = useSessions();

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "teacher">("week");
  const [selectedTeacherForModal, setSelectedTeacherForModal] =
    useState<Teacher | null>(null);

  const weekDates = getWeekDates(weekOffset);
  const DAYS = language === "ar" ? DAYS_AR : DAYS_EN;
  
  const dateRange = useMemo(() => {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 2);
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  }, []);

  const { data: teachersData, isLoading: loading, isError, error } = useTeacherAvailability(
    dateRange.start,
    dateRange.end
  );

  const teachers = useMemo(() => teachersData || [], [teachersData]);
  const sessions = useMemo(() => mapTeachersToSessions(teachers), [teachers]);

  const UI_TEACHERS: Teacher[] = useMemo(() => {
    return teachers.map((t, index) => ({
      id: t.id,
      name: t.user?.name || "Unknown",
      subject: "General",
      color: [
        "bg-[#6366f1]",
        "bg-[#8b5cf6]",
        "bg-[#ec4899]",
        "bg-[#f43f5e]",
        "bg-[#06b6d4]",
        "bg-[#10b981]",
        "bg-[#f59e0b]",
      ][index % 7],
    }));
  }, [teachers]);

  const busySlots = useMemo(() => {
    const slots: Record<
      string,
      {
        teacherName: string;
        teacherId: string;
        studentName: string;
        time: string;
        endTime: string;
        subject: string;
      }[]
    > = {};
    sessions.forEach((session) => {
      const key = `${session.date}-${session.teacherId}`;
      if (!slots[key]) slots[key] = [];
      slots[key].push({
        teacherName: session.teacherName,
        teacherId: session.teacherId,
        studentName: session.studentName,
        time: session.time,
        endTime: session.endTime,
        subject: session.subject,
      });
    });
    return slots;
  }, [sessions]);

  const teacherStats = useMemo(() => {
    return UI_TEACHERS.map((teacher) => {
      const teacherSessions = sessions.filter(
        (s) => s.teacherId === teacher.id,
      );

      const weekSessions = teacherSessions.filter((s) => {
        const sessionDate = new Date(s.date);
        return weekDates.some((d) => formatDate(d) === formatDate(sessionDate));
      });

      return {
        ...teacher,
        totalSessions: teacherSessions.length,
        weekSessions: weekSessions.length,
        busyHours: weekSessions.length,
      };
    });
  }, [sessions, weekDates, UI_TEACHERS]);

  const teacherOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: language === "ar" ? "كل المعلمين" : "All Teachers",
      },
      ...UI_TEACHERS.map((t) => ({
        value: t.id,
        label: t.name,
        searchText: t.name,
      })),
    ];
  }, [UI_TEACHERS, language]);

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        {error?.message || "Failed to load teacher availability"}
      </div>
    );
  }

  const isTeacherBusy = (
    teacherId: string,
    date: Date,
    hour: number,
  ): boolean => {
    const dateStr = formatDate(date);
    const key = `${dateStr}-${teacherId}`;
    const daySlots = busySlots[key] || [];
    return daySlots.some((slot) => {
      const start = parseTime(slot.time);
      const end = parseTime(slot.endTime);
      return hour >= start && hour < end;
    });
  };

  const getSlotInfo = (teacherId: string, date: Date, hour: number) => {
    const dateStr = formatDate(date);
    const key = `${dateStr}-${teacherId}`;
    const daySlots = busySlots[key] || [];
    return daySlots.find((slot) => {
      const start = parseTime(slot.time);
      const end = parseTime(slot.endTime);
      return hour >= start && hour < end;
    });
  };

  const displayedTeachers =
    selectedTeacherId === "all"
      ? UI_TEACHERS
      : UI_TEACHERS.filter((t) => t.id === selectedTeacherId);

  // const teacherStats = useMemo(() => {
  //   return TEACHERS.map((teacher) => {
  //     const teacherSessions = sessions.filter(
  //       (s) => s.teacherName === teacher.name,
  //     );
  //     const weekSessions = teacherSessions.filter((s) => {
  //       const sessionDate = new Date(s.date);
  //       return weekDates.some((d) => formatDate(d) === formatDate(sessionDate));
  //     });
  //     return {
  //       ...teacher,
  //       totalSessions: teacherSessions.length,
  //       weekSessions: weekSessions.length,
  //       busyHours: weekSessions.length,
  //     };
  //   });
  // }, [sessions, weekDates]);


  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "ar" ? "المعلمون المتاحون" : "Teacher Availability"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {language === "ar"
              ? "جدول توافر المعلمين الأسبوعي"
              : "Weekly teacher availability schedule"}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100/50 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("week")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "week" ? "bg-white text-[#6366f1] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {language === "ar" ? "عرض أسبوعي" : "Week View"}
          </button>
          <button
            onClick={() => setViewMode("teacher")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "teacher" ? "bg-white text-[#6366f1] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {language === "ar" ? "عرض المعلمين" : "Teacher View"}
          </button>
        </div>
      </div>

      {viewMode === "teacher" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            Array(6).fill(null).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="bg-white rounded-[24px] border border-gray-100 p-6 h-[280px] animate-pulse">
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-2 mt-2">
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl h-16"></div>
                  <div className="bg-gray-50 rounded-2xl h-16"></div>
                </div>
              </div>
            ))
          ) : teacherStats.length === 0 ? (
            <p className="col-span-full py-16 text-center text-gray-400 font-medium">
              {language === "ar" ? "لا يوجد معلمون متاحون" : "No teachers available"}
            </p>
          ) : teacherStats.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`${teacher.color} px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {teacher.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold">{teacher.name}</p>
                    <p className="text-white text-opacity-80 text-xs">
                      {teacher.subject}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {language === "ar" ? "هذا الأسبوع" : "This Week"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teacher.weekSessions}
                    </p>
                    <p className="text-xs text-gray-400">
                      {language === "ar" ? "حصة" : "sessions"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {language === "ar" ? "الإجمالي" : "Total"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teacher.totalSessions}
                    </p>
                    <p className="text-xs text-gray-400">
                      {language === "ar" ? "حصة" : "sessions"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {DAYS_AR.map((day, idx) => {
                    const date = weekDates[idx];
                    const dateStr = formatDate(date);
                    // const hasSessions = sessions.some(
                    //   (s) =>
                    //     s.teacherName === teacher.name && s.date === dateStr,
                    // );
                    const hasSessions = sessions.some(
                      (s) => s.teacherId === teacher.id && s.date === dateStr,
                    );
                    return (
                      <div
                        key={day}
                        className={`flex-1 min-w-0 py-1.5 rounded-lg text-center text-xs font-medium ${hasSessions
                            ? `${teacher.color} text-white`
                            : "bg-gray-100 text-gray-400"
                          }`}
                        title={hasSessions ? (language === "ar" ? "مشغول" : "Busy") : day}
                      >
                        <div className="flex flex-col items-center">
                          <span>{day.slice(0, 1)}</span>
                          {hasSessions && (
                            <span className="text-[8px] mt-0.5 font-bold uppercase">
                              {language === "ar" ? "مشغول" : "Busy"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedTeacherForModal(teacher)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-[#6366f1] rounded-xl text-xs font-bold transition-all hover:bg-[#6366f1] hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {language === "ar" ? "عرض الجدول" : "View Schedule"}
                  </button>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${teacher.weekSessions > 0 ? "bg-amber-400" : "bg-emerald-400"}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${teacher.weekSessions > 0 ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {teacher.weekSessions > 0
                        ? `${language === "ar" ? "مشغول" : "Busy"} (${teacher.weekSessions})`
                        : language === "ar"
                          ? "متاح"
                          : "Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#6366f1] transition-all"
              >
                {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <span className="text-sm font-bold text-gray-700 px-3 min-w-[180px] text-center">
                {weekDates[0].toLocaleDateString(language === 'ar' ? "ar-SA" : "en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {weekDates[6].toLocaleDateString(language === 'ar' ? "ar-SA" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#6366f1] transition-all"
              >
                {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            <div className="w-72">
              <CustomSelect
                value={selectedTeacherId}
                options={teacherOptions}
                onChange={(val) => setSelectedTeacherId(val as string)}
              />
            </div>
          </div>

          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-200 border border-red-300" />
              <span className="text-gray-600">
                {language === "ar" ? "مشغول - لديه حصة" : "Busy - Has Session"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span className="text-gray-600">
                {language === "ar" ? "متاح" : "Available"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(4).fill(null).map((_, idx) => (
                <div key={`week-skel-${idx}`} className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 animate-pulse">
                   <div className="flex gap-3 items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-32 h-4 bg-gray-200 rounded"></div>
                       <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                     </div>
                     <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
                   </div>
                   <div className="h-32 bg-gray-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : displayedTeachers.length === 0 ? (
            <p className="col-span-full py-10 text-center text-gray-500">
              {language === "ar" ? "لا يوجد معلمون متاحون" : "No teachers available"}
            </p>
          ) : displayedTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div
                className={`${teacher.color} px-5 py-3 flex items-center justify-between`}
              >
                <button
                  onClick={() => setSelectedTeacherForModal(teacher)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {language === "ar" ? "عرض" : "View"}
                </button>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-white font-bold text-sm text-start">
                      {teacher.name}
                    </p>
                    <p className="text-white text-xs opacity-80 text-start">
                      {teacher.subject}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {teacher.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-start text-gray-600 font-medium w-20 sticky right-0 bg-gray-50 border-l border-gray-200">
                        {language === "ar" ? "الوقت" : "Time"}
                      </th>
                      {weekDates.map((date, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-2 text-center text-gray-600 font-medium min-w-[90px]"
                        >
                          <div>{DAYS[date.getDay()]}</div>
                          <div className="text-gray-400 font-normal">
                            {date.getDate()}/{date.getMonth() + 1}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map((hour) => (
                      <tr key={hour.value} className="border-b border-gray-100">
                        <td className="px-3 py-1.5 text-start text-gray-500 whitespace-nowrap sticky right-0 bg-white border-l border-gray-200">
                          {hour.label}
                        </td>
                        {weekDates.map((date, idx) => {
                          // const busy = isTeacherBusy(
                          //   teacher.name,
                          //   date,
                          //   hour.value,
                          // );
                          const busy = isTeacherBusy(
                            teacher.id,
                            date,
                            hour.value,
                          );
                          const info = busy
                            ? getSlotInfo(teacher.id, date, hour.value)
                            : null;
                          return (
                            <td key={idx} className="px-1 py-1 text-center">
                              {busy && info ? (
                                <div className="bg-red-100 border border-red-200 rounded-md px-1 py-1 group relative cursor-default">
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-1">
                                      <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                      <span className="text-red-700 text-[10px] font-bold">
                                        {language === "ar" ? "مشغول" : "Busy"}
                                      </span>
                                    </div>
                                    <span className="text-red-600 text-[9px] truncate max-w-[70px]">
                                      {info.studentName}
                                    </span>
                                  </div>
                                  <div className="absolute z-10 bottom-full right-0 mb-1 bg-gray-900 text-white text-xs rounded-lg p-2 w-40 hidden group-hover:block shadow-lg">
                                    <p className="font-medium">
                                      {info.studentName}
                                    </p>
                                    <p className="text-gray-300">
                                      {info.time} - {info.endTime}
                                    </p>
                                    <p className="text-gray-300">
                                      {info.subject}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-green-50 border border-green-100 rounded-md py-1 flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      {selectedTeacherForModal && (
        <TeacherDetailModal
          teacher={selectedTeacherForModal}
          sessions={sessions}
          onClose={() => setSelectedTeacherForModal(null)}
          language={language}
        />
      )}
    </div>
  );
}