import { useState, useEffect } from 'react';
import { Search, Eye, Plus, Video, X } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import ViewSessionModal from '../../../components/modals/ViewSessionModal';
import { Schedule } from '../../../types/scheduales';
import { useSubjects } from '../../../features/admin/hooks/useSubjects';
import { Subject } from '../../../types/subject';
import { useJoinToSession, useUserSessions } from '../../../hooks/useSessions';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import CreateRequestModal from '../../../components/modals/CreateRequestModal';
import FeedbackModal from '../components/FeedbackModal';
import { useSettings } from '../../../contexts/SettingsContext';
import { leaveSession } from '../../../services/SessionsServices';



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

  const { settings } = useSettings();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [sessionForRequest, setSessionForRequest] = useState<Schedule | null>(null);
  const isRtl = language === 'ar';

  // Update current time every 30 seconds to refresh "Join" button state
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const isJoinable = (startTime: string, endTime: string, link: string) => {
    if (!link) return false;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const oneMinuteBefore = new Date(start.getTime() - 60000);
    return now >= oneMinuteBefore && now <= end;
  };

  const { data: sessionResponse, isLoading } = useUserSessions(debouncedSearch);
  const { mutateAsync: joinToSession, isPending: isJoining } = useJoinToSession();
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
      if (diff < 0) diff += 24 * 60*5;
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
                        {session.student.user.name}
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
                          onClick={async () => {
                            try {
                              await joinToSession(session.id);
                              window.open(session.link, '_blank');
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          disabled={isJoining || !isJoinable(session.start_time, session.end_time, session.link)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${isJoinable(session.start_time, session.end_time, session.link)
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
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
                          disabled={session.status?.toLowerCase() === 'completed'}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${session.status?.toLowerCase() === 'completed'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          <span className="text-sm">{t('endSession') || 'End Session'}</span>
                        </button>
                      </td>

                      <td className="px-3 py-3 text-start">
                        <button
                          onClick={() => {
                            setSessionForRequest(session);
                            setIsRequestModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-white font-normal transition-all hover:opacity-90 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          <Plus className="w-5 h-5" />
                          {isRtl ? 'طلب جديد' : 'Add Request'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => {
                              const grouped = session.parent_recurring_id
                                ? scheduleData.filter((s: Schedule) => s.parent_recurring_id === session.parent_recurring_id)
                                : [session];
                              setGroupedSessions(grouped);
                              setSelectedSession(session);
                              setShowViewModal(true);
                            }}
                            className="p-2 icon-btn-primary rounded-lg transition-colors"
                            title={t('view')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
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
    </div>
  );
}
