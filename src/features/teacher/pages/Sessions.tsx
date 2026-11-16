import { useState, useEffect } from 'react';
import { Search, Eye, Plus, Video } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import ViewSessionModal from '../../../components/modals/ViewSessionModal';
import { Schedule } from '../../../types/scheduales';
import { useSubjects } from '../../../features/admin/hooks/useSubjects';
import { Subject } from '../../../types/subject';
import { useJoinToSession, useUserSessions, useEndSession } from '../../../hooks/useSessions';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import CreateRequestModal from '../../../components/modals/CreateRequestModal';
import FeedbackModal from '../components/FeedbackModal';
import ViolationGuidelinesModal from '../../../components/modals/ViolationGuidelinesModal';
import { useSettings } from '../../../contexts/SettingsContext';
import { leaveSession } from '../../../services/SessionsServices';
import { Tooltip } from 'antd';
import JitsiMeetingModal, { JitsiRoomData } from '../../../components/modals/JitsiMeetingModal';



export default function Sessions() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split("-")[0];
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Schedule | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<Schedule[]>([]);
  const [now, setNow] = useState(new Date());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [sessionForFeedback, setSessionForFeedback] = useState<Schedule | null>(null);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  const [sessionToJoin, setSessionToJoin] = useState<Schedule | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<{
    session: Schedule;
    roomData: JitsiRoomData;
  } | null>(null);

  const { settings } = useSettings();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [sessionForRequest, setSessionForRequest] = useState<Schedule | null>(null);
  const isRtl = language === 'ar';

  // Update current time every 30 seconds to refresh "Join" button state
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const isSessionCompletedOrEnded = (session: Schedule) => {
    const status = session.status?.toLowerCase();
    if (status === 'completed' || status === 'cancelled' || status === 'ended') {
      return true;
    }
    if (session.end_time) {
      const end = new Date(session.end_time);
      if (!isNaN(end.getTime()) && now > end) {
        return true;
      }
    }
    return false;
  };

  const isJoinable = (startTime: string, endTime: string, _link?: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const fiveMinutesBefore = new Date(start.getTime() - 300000);
    return now >= fiveMinutesBefore && now <= end;
  };

  const isEndable = (startTime: string) => {
    const start = new Date(startTime);
    const fifteenMinutesAfter = new Date(start.getTime() + 900000);
    return now >= fifteenMinutesAfter;
  };


  const { data: sessionResponse, isLoading } = useUserSessions(debouncedSearch);
  const { mutateAsync: joinToSession, isPending: isJoining } = useJoinToSession();
  const { mutateAsync: endSession } = useEndSession();
  useEffect(() => {
    if (searchTerm.length > 2) {
      setDebouncedSearch(searchTerm);
    } else {
      setDebouncedSearch("");
    }
  }, [searchTerm]);

  const itemsPerPage = 5;
  const scheduleData = sessionResponse?.data || [];

  const displaySchedules: Schedule[] = [];
  const seenParents = new Set<string>();

  scheduleData.forEach((schedule: Schedule) => {
    if (schedule.parent_recurring_id) {
      if (!seenParents.has(schedule.parent_recurring_id)) {
        seenParents.add(schedule.parent_recurring_id);
        displaySchedules.push(schedule);
      }
    } else {
      displaySchedules.push(schedule);
    }
  });

  const totalPages = Math.ceil(displaySchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = displaySchedules.slice(startIndex, endIndex);

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
      if (diff < 0) diff += 24 * 60 * 5;
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
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={itemsPerPage} columns={7} />
          ) : (
            <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('sessionTitleLabel')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('studentLabel')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('subjectLabel')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('dateTime')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('duration')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('status')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('joinSession')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('leaveSession')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('AddRequest')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSessions.length > 0 ? (
                  currentSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-start">
                        <span className="font-medium text-gray-900">
                          {session.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-start">
                        {(() => {
                          let names: string[] = [];
                          if (session.groupStudents && Array.isArray(session.groupStudents) && session.groupStudents.length > 0) {
                            names = session.groupStudents.map((gs: any) => gs?.student?.user?.name || gs?.student?.name).filter(Boolean);
                          } else if (session.students && Array.isArray(session.students) && session.students.length > 0) {
                            names = session.students.map((st: any) => st?.user?.name || st?.name).filter(Boolean);
                          } else if (session.student) {
                            const singleName = session.student?.user?.name || (session.student as any)?.name;
                            if (singleName) names = [singleName];
                          }

                          if (!names || names.length === 0) {
                            return <span className="text-gray-400 font-medium">{language === 'ar' ? 'غير محدد' : 'N/A'}</span>;
                          }

                          const AVATAR_BG = [
                            "from-indigo-500 to-purple-600",
                            "from-blue-500 to-cyan-600",
                            "from-emerald-500 to-teal-600",
                            "from-amber-500 to-orange-600",
                            "from-rose-500 to-pink-600",
                          ];

                          if (names.length === 1) {
                            return (
                              <div className="flex items-center justify-start gap-2">
                                <Tooltip title={names[0]} placement="top">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm ring-2 ring-white shrink-0 cursor-pointer hover:scale-110 transition-all">
                                    {names[0].charAt(0).toUpperCase()}
                                  </div>
                                </Tooltip>
                                <span className="font-semibold text-gray-800 text-xs">{names[0]}</span>
                              </div>
                            );
                          }

                          const maxVisible = 3;
                          const overflowCount = names.length - maxVisible;

                          return (
                            <div className="flex items-center justify-start">
                              <div className="flex -space-x-2 space-x-reverse items-center p-0.5">
                                {names.slice(0, maxVisible).map((name, idx) => (
                                  <Tooltip key={idx} title={name} placement="top">
                                    <div
                                      className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[11px] ring-2 ring-white shadow-sm bg-gradient-to-br ${AVATAR_BG[idx % AVATAR_BG.length]} cursor-pointer hover:z-10 hover:scale-110 transition-all`}
                                    >
                                      {name.charAt(0).toUpperCase()}
                                    </div>
                                  </Tooltip>
                                ))}
                                {overflowCount > 0 && (
                                  <Tooltip
                                    placement="top"
                                    title={
                                      <div className="p-1 space-y-1 text-xs max-h-48 overflow-y-auto custom-scrollbar">
                                        <div className="font-bold border-b border-gray-700 pb-1 mb-1 text-gray-200">
                                          {language === 'ar' ? `جميع الطلاب (${names.length})` : `All Students (${names.length})`}
                                        </div>
                                        {names.map((n, i) => (
                                          <div key={i} className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                                            {n}
                                          </div>
                                        ))}
                                      </div>
                                    }
                                  >
                                    <div className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white shadow-sm cursor-pointer hover:z-10 hover:scale-110 transition-all">
                                      +{overflowCount}
                                    </div>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span className="text-primary font-medium">
                          {getSubjectName(session)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-start">
                        {(() => {
                          const { date, time } = formatDateTime(
                            session.start_time,
                          );
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="font-medium text-gray-900">
                                {date}
                              </span>
                              <div className="flex items-center gap-2">
                                {time && (
                                  <span
                                    className="text-sm text-gray-500"
                                    dir="ltr"
                                  >
                                    {time}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-start">
                        {calculateDuration(
                          session.start_time,
                          session.end_time,
                        )}{" "}
                        {t("minutes")}
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(session.status)}`}
                        >
                          {t(session.status?.toLowerCase() || "")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <button
                          onClick={() => {
                            setSessionToJoin(session);
                            setIsGuidelinesModalOpen(true);
                          }}
                          disabled={isJoining || isSessionCompletedOrEnded(session) || !isJoinable(session.start_time, session.end_time, session.link)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${isSessionCompletedOrEnded(session) || !isJoinable(session.start_time, session.end_time, session.link)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                              : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                            } ${isJoining ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <Video className="w-4 h-4" />
                          <span className="text-sm">{isJoining ? t('joining...') || 'Joining...' : t('joinSession')}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-start">
                        <button
                          onClick={async () => {
                            try {
                              await leaveSession(session.id);
                              setSessionForFeedback(session);
                              setShowFeedbackModal(true);
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          disabled={isSessionCompletedOrEnded(session) || !isEndable(session.start_time)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm ${isSessionCompletedOrEnded(session) || !isEndable(session.start_time)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                              : 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                            }`}
                        >
                          {t('leaveSession')}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-start">
                        <button
                          onClick={() => {
                            setSessionForRequest(session);
                            setIsRequestModalOpen(true);
                          }}
                          disabled={isSessionCompletedOrEnded(session)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm ${isSessionCompletedOrEnded(session)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                              : 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                            }`}
                        >
                          <Plus className="w-4 h-4" />
                          {t('AddRequest')}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              const group = scheduleData.filter((s: Schedule) =>
                                s.parent_recurring_id && s.parent_recurring_id === session.parent_recurring_id
                              );
                              setGroupedSessions(group);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title={t('view')}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      {t('No Sessions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={scheduleData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      <ViewSessionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSession(null);
          setGroupedSessions([]);
        }}
        session={selectedSession}
        groupedSessions={groupedSessions}
        allSessions={scheduleData}
      />
      <CreateRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => { setIsRequestModalOpen(false); setSessionForRequest(null); }}
        sessionId={sessionForRequest?.id}
        sessionTitle={sessionForRequest?.title}
      />

      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSessionForFeedback(null);
        }}
        sessionId={sessionForFeedback?.id || ""}
        sessionTitle={sessionForFeedback?.title || ""}
      />

      <ViolationGuidelinesModal
        isOpen={isGuidelinesModalOpen}
        onClose={() => {
          setIsGuidelinesModalOpen(false);
          setSessionToJoin(null);
        }}
        isJoining={isJoining}
        onConfirmJoin={async () => {
          if (!sessionToJoin) return;
          try {
            const roomData = await joinToSession(sessionToJoin.id);
            setActiveMeeting({
              session: sessionToJoin,
              roomData,
            });
            setIsGuidelinesModalOpen(false);
            setSessionToJoin(null);
          } catch (error) {
            console.error(error);
          }
        }}
      />

      <JitsiMeetingModal
        isOpen={Boolean(activeMeeting)}
        onClose={() => setActiveMeeting(null)}
        roomData={activeMeeting?.roomData || null}
        sessionTitle={activeMeeting?.session.title}
        isTeacher={true}
        onLeave={async () => {
          if (!activeMeeting?.session.id) return;
          try {
            await leaveSession(activeMeeting.session.id);
            setSessionForFeedback(activeMeeting.session);
            setShowFeedbackModal(true);
          } catch (error) {
            console.error('Leave session error:', error);
          } finally {
            setActiveMeeting(null);
          }
        }}
        onEndSession={async () => {
          if (!activeMeeting?.session.id) return;
          try {
            await endSession(activeMeeting.session.id);
          } catch (error) {
            console.error('End session error:', error);
          } finally {
            setActiveMeeting(null);
          }
        }}
      />
    </div>
  );
}
