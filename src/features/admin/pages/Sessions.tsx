import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Eye, Trash2, Edit } from "lucide-react";
import Pagination from "../../../components/ui/Pagination";
import { useTranslation } from "react-i18next";
import {
  useSearchSchedules,
  useCreateSchedule,
  useCreateRecurringSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useDeleteGroupedSchedule,
} from "../hooks/useSchedules";
import AddSessionModal from "../../../components/modals/AddSessionModal";
import ViewSessionModal from "../../../components/modals/ViewSessionModal";
import EditSessionModal from "../../../components/modals/EditSessionModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { Schedule, UpdateSchedulePayload } from "../../../types/scheduales";
import {
  MultipleSessionsPayload,
} from "../../../lib/schemas/SessionSchema";

import { useSubjects } from "../hooks/useSubjects";
import { Subject } from "../../../types/subject";

export default function Sessions() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split("-")[0];
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Schedule | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<Schedule[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<Schedule | null>(null);

  const createSchedule = useCreateSchedule();
  const createRecurringSchedule = useCreateRecurringSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const deleteGroupedSchedule = useDeleteGroupedSchedule();

  const handleUpdateSession = async (
    id: string,
    data: UpdateSchedulePayload,
  ) => {
    try {
      await updateSchedule.mutateAsync({ id, data });
      setShowEditModal(false);
      setSelectedSession(null);
    } catch (error) {
      console.error("Update session failed:", error);
      throw error;
    }
  };

  const handleDeleteSession = (session: Schedule) => {
    setSessionToDelete(session);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      if (sessionToDelete.is_recurring) {
        await deleteGroupedSchedule.mutateAsync(
          sessionToDelete.parent_recurring_id || sessionToDelete.id,
        );
      } else {
        await deleteSchedule.mutateAsync(sessionToDelete.id);
      }
      setSessionToDelete(null);
    } catch (error) {
      console.error("Delete session failed:", error);
    }
  };

  const handleAddSession = async (data: any) => {
    try {
      if (data.formData) {
        // Batch / Recurring Scheduling
        const { formData, sessions, selectedDays } = data as MultipleSessionsPayload;

        const tomorrowStr = (() => {
          const tom = new Date();
          tom.setDate(tom.getDate() + 1);
          return tom.toISOString().split("T")[0];
        })();

        const rawStartDate = formData.batchStartDate || (formData.monthYear ? `${formData.monthYear}-01` : tomorrowStr);
        const rawEndDate = formData.batchEndDate || (formData.monthYear ? `${formData.monthYear}-28` : tomorrowStr);

        const startDate = rawStartDate < tomorrowStr ? tomorrowStr : rawStartDate;
        const endDate = rawEndDate;

        await createRecurringSchedule.mutateAsync({
          studentId: formData.student,
          teacherId: formData.teacher,
          subject_id: formData.subject,
          title: formData.title,
          description: formData.description || "",
          link: formData.meetingLink || "",
          notes: formData.notes || "",
          startTime: sessions[0]?.time || "00:00",
          days: selectedDays,
          startDate,
          endDate,
          notification_Time: formData.notification_Time || "10",
          // type: formData.type,
        });
      } else {
        // Single Session Scheduling
        const [year, month, day] = data.sessionDate.split("-").map(Number);
        const [hour, minute] = data.startTime.split(":").map(Number);
        const localDate = new Date(year, month - 1, day, hour, minute);

        await createSchedule.mutateAsync({
          studentId: data.student,
          teacherId: data.teacher,
          subject_id: data.subject,
          title: data.title,
          description: data.description || "",
          link: data.meetingLink || "",
          notes: data.notes || "",
          start_time: localDate.toISOString(),
          // type: data.type,
          notification_Time: data.notification_Time,
        });
      }
      setShowAddModal(false);
    } catch (error) {
      console.error("Add session failed:", error);
      throw error;
    }
  };

 

  useEffect(() => {
    if (searchTerm.length > 2) {
      setDebouncedSearch(searchTerm);
    } else {
      setDebouncedSearch("");
    }
  }, [searchTerm]);

  const itemsPerPage = 10;
  const dateFilters = useMemo(() => ({
    fromDate,
    toDate,
  }), [fromDate, toDate]);
  const { data: searchResults } = useSearchSchedules(debouncedSearch, currentPage, itemsPerPage, dateFilters);

  const scheduleData: Schedule[] = searchResults?.data?.schedule ?? [];

  const groupedSchedules: Schedule[] = [];
  const seenParents = new Set<string>();

  // Map each parent_recurring_id to all of its sessions in the list 
  const parentGroups = new Map<string, Schedule[]>();
  scheduleData.forEach((schedule: Schedule) => {
    if (schedule.parent_recurring_id) {
      const group = parentGroups.get(schedule.parent_recurring_id) || [];
      group.push(schedule);
      parentGroups.set(schedule.parent_recurring_id, group);
    }
  });

  scheduleData.forEach((schedule: Schedule) => {
    if (schedule.parent_recurring_id) {
      if (!seenParents.has(schedule.parent_recurring_id)) {
        seenParents.add(schedule.parent_recurring_id);

        const groupSessions = parentGroups.get(schedule.parent_recurring_id) || [];
        const now = new Date().getTime();

        // Separate upcoming vs past sessions to determine the nearest one
        const upcoming = groupSessions.filter(
          (s) => new Date(s.start_time).getTime() >= now
        );

        let nearestSession = schedule;
        if (upcoming.length > 0) {
          // Sort upcoming ascending (closest future date first)
          upcoming.sort(
            (a, b) =>
              new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          nearestSession = upcoming[0];
        } else if (groupSessions.length > 0) {
          // Sort past descending (closest past date first)
          const past = [...groupSessions];
          past.sort(
            (a, b) =>
              new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
          );
          nearestSession = past[0];
        }

        groupedSchedules.push(nearestSession);
      }
    } else {
      groupedSchedules.push(schedule);
    }
  });

  const totalItems = searchResults?.data?.pagination?.totalItems || 0;
  const totalPages = searchResults?.data?.pagination?.totalPages || 1;

  const displaySchedules = groupedSchedules.filter((session) => {
    const sessionDate = new Date(session.start_time);
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    return (!from || sessionDate >= from) && (!to || sessionDate <= to);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, fromDate, toDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculateDuration = (startTime: any, endTime: any) => {
    if (!startTime || !endTime) return 0;
    
    // Check if they are full ISO/Date strings by trying to parse them with Date
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    if (!isNaN(start) && !isNaN(end)) {
      return Math.max(0, Math.round((end - start) / 60000));
    }
    
    // If not parseable as full dates, fall back to "HH:MM" string split
    try {
      const getMinutes = (timeStr: string) => {
        // If it contains "T", extract the time part first
        const cleanTime = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
        const parts = cleanTime.split(":");
        const h = Number(parts[0]) || 0;
        const m = Number(parts[1]) || 0;
        return h * 60 + m;
      };
      
      const startTotal = getMinutes(String(startTime));
      const endTotal = getMinutes(String(endTime));
      let diff = endTotal - startTotal;
      if (diff < 0) diff += 24 * 60;
      return diff;
    } catch {
      return 0;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: "", time: "" };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: dateString, time: "" };
      const formattedDate = date.toLocaleDateString(
        language === "ar" ? "ar-EG" : "en-US",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      );
      const formattedTime = date.toLocaleTimeString(
        language === "ar" ? "ar-EG" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );
      return { date: formattedDate, time: formattedTime };
    } catch (e) {
      return { date: dateString, time: "" };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-primary-50 text-blue-700 border-blue-200";
      case "planned":
        return "bg-primary-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const { data: subjects } = useSubjects();
  const dynamicsubjects = subjects?.subjects || [];

  const getSubjectName = (session: Schedule) => {
    if (session.subject) {
      return language === "ar"
        ? session.subject.name_ar
        : session.subject.name_en;
    }
    const subject = dynamicsubjects.find(
      (s: Subject) => s.id === session.subjectId,
    );
    return subject
      ? language === "ar"
        ? subject.name_ar
        : subject.name_en
      : "subject";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("sessionsTitle")}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <Search
                className={`absolute ${language === "ar" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`}
              />
              <input
                type="text"
                placeholder={t("searchSessionsPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${language === "ar" ? "pr-12 text-right" : "pl-12"} py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent`}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                {t("singleSession")}
              </button>
            
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <label className="block text-start">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                {language === "ar" ? "من تاريخ" : "From Date"}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white"
              />
            </label>
            <label className="block text-start">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                {language === "ar" ? "إلى تاريخ" : "To Date"}
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary text-start bg-white"
              />
            </label>
          </div>

          {(fromDate || toDate) && (
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                {language === "ar" ? "مسح التاريخ" : "Clear Date"}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("sessionTitleLabel")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("studentLabel")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("teacherLabel")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("subjectLabel")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("dateTime")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("duration")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("status")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displaySchedules.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {session.title}
                      </span>
                      {/* {(session.is_recurring || session.parent_recurring_id) && (
                          <span title={language === 'ar' ? 'جلسة متكررة' : 'Recurring Session'} className="flex items-center justify-center p-1 bg-primary-50 text-indigo-500 rounded text-xs">
                            <RefreshCw className="w-3 h-3" />
                          </span>
                       )} */}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-right">
                    {session.student.user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-right">
                    {session.teacher.user.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-primary font-medium">
                      {getSubjectName(session)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-right">
                    {(() => {
                      const { date, time } = formatDateTime(session.start_time);
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900">
                            {date}
                          </span>
                          <div className="flex items-center gap-2">
                            {time && (
                              <span className="text-sm text-gray-500" dir="ltr">
                                {time}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-right">
                    {calculateDuration(session.start_time, session.end_time)}{" "}
                    {t("minutes")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(session.status)}`}
                    >
                      {t(session.status?.toLowerCase() || "")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          const grouped = session.parent_recurring_id
                            ? scheduleData.filter(
                                (s: Schedule) =>
                                  s.parent_recurring_id ===
                                  session.parent_recurring_id,
                              )
                            : [session];
                          setGroupedSessions(grouped);
                          setSelectedSession(session);
                          setShowViewModal(true);
                        }}
                        className="p-2 icon-btn-primary rounded-lg transition-colors"
                        title={t("view")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title={t("edit")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t("delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
      <AddSessionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSession}
      />


      <ViewSessionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSession(null);
          setGroupedSessions([]);
        }}
        session={selectedSession}
        groupedSessions={groupedSessions}
      />

      <EditSessionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSave={handleUpdateSession}
      />

      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
