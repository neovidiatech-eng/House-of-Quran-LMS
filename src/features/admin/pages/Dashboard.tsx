import { Notebook, Users, ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardCard from "../../../components/ui/Card";
import Pagination from "../../../components/ui/Pagination";
import ActiveUsersChart from "../components/ActiveUsersChart";
import RevenueExpenseChart from "../components/RevenueExpenseChart";
import RecentActivity from "../components/RecentActivity";
import { useActivityLogs, useAdminDashboard } from "../hooks/useAdminDashboard";
import { useTranslation } from "react-i18next";


const formatSessionTime = (
  isoString: string,
  language: string
): string => {
  try {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) return isoString;

    return date.toLocaleString(language.split("-")[0] === "ar" ? "ar-EG" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  const { data: stats, isLoading, isError } = useAdminDashboard();
  const { data: logsData, isLoading: logsLoading } = useActivityLogs();
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const logsItemsPerPage = 5;
  const activityLogs = logsData?.data || [];
  const logsTotalPages = Math.max(1, Math.ceil(activityLogs.length / logsItemsPerPage));
  const paginatedLogs = useMemo(() => {
    const startIndex = (logsCurrentPage - 1) * logsItemsPerPage;
    return activityLogs.slice(startIndex, startIndex + logsItemsPerPage);
  }, [activityLogs, logsCurrentPage]);

  useEffect(() => {
    if (logsCurrentPage > logsTotalPages) {
      setLogsCurrentPage(logsTotalPages);
    }
  }, [logsCurrentPage, logsTotalPages]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mx-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 flex flex-col justify-between"
            >
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mt-4"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-3">
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[380px]">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-[200px] bg-gray-100 rounded-full w-[200px] mx-auto mt-8"></div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[380px]">
            <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-[260px] bg-gray-100 rounded-2xl w-full mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8 bg-white rounded-3xl border border-red-100 shadow-sm mx-3 my-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {t("dashboard.loadErrorTitle")}
        </h3>

        <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
          {t("dashboard.loadErrorDescription")}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#369589] hover:bg-[#2c7a70] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg shadow-teal-100"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mx-3 gap-6">
        <DashboardCard
          title={t("dashboard.totalStudents")}
          value={stats?.stats?.totalStudents ?? 0}
          unit={t("dashboard.student")}
          percentage=""
          isIncrease={true}
          subText={t("dashboard.totalOverall")}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: <Users size={20} className="text-[#00a8a8]" />,
          }}
        />

        <DashboardCard
          title={t("dashboard.totalTeachers")}
          value={stats?.stats?.totalTeachers ?? 0}
          unit={t("dashboard.teacher")}
          percentage=""
          isIncrease={true}
          subText={t("dashboard.totalOverall")}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: <Users size={20} className="text-[#00a8a8]" />,
          }}
        />

        <DashboardCard
          title={t("dashboard.todaySessions")}
          value={stats?.stats?.todaySessions ?? 0}
          unit={t("dashboard.session")}
          percentage=""
          isIncrease={true}
          subText={t("dashboard.scheduledToday")}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: <Notebook size={20} className="text-[#00a8a8]" />,
          }}
        />

        <DashboardCard
          title={t("dashboard.pendingRequests")}
          value={stats?.stats?.pendingRequests ?? 0}
          unit={t("dashboard.request")}
          percentage=""
          isIncrease={false}
          subText={t("dashboard.waitingReview")}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: <ClipboardList size={20} className="text-[#00a8a8]" />,
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-3">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <ActiveUsersChart activeUsers={stats?.activeUsers} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <RevenueExpenseChart sessionsData={stats?.sessionsPerDay} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-3">
        {/* Recent Activity */}
        <div className="h-full">
          <RecentActivity activities={stats?.activityFeed} />
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs bg-[#eefcfc] text-[#00a8a8] px-3 py-1 rounded-full font-bold">
              {t("dashboard.scheduledSoon")}
            </span>

            <h2 className="text-lg font-bold text-gray-800 text-start">
              {t("dashboard.upcomingSessions")}
            </h2>
          </div>

          {stats?.upcomingSessions &&
          stats.upcomingSessions.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold">
                    <th className="pb-3 font-bold">
                      {t("dashboard.subject")}
                    </th>

                    <th className="pb-3 font-bold">
                      {t("dashboard.teacherColumn")}
                    </th>

                    <th className="pb-3 font-bold">
                      {t("dashboard.studentColumn")}
                    </th>

                    <th className="pb-3 font-bold">
                      {t("dashboard.time")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {stats.upcomingSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      <td className="py-4 font-bold text-gray-800">
                        {session.subject || session.title}
                      </td>

                      <td className="py-4 text-gray-600 font-medium">
                        {session.teacher}
                      </td>

                      <td className="py-4 text-gray-600 font-medium">
                        {session.student}
                      </td>

                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold">
                          {formatSessionTime(
                            session.time,
                            i18n.language
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[#eefcfc] rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📅</span>
              </div>

              <p className="text-gray-500 text-sm font-medium">
                {t("dashboard.noUpcomingSessions")}
              </p>

              <p className="text-gray-400 text-xs mt-1">
                {t("dashboard.scheduledSessionsAppear")}
              </p>
            </div>
          )}
        </div>

        
      </div>
      {/* Activity Logs */}
<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mx-3">
  <div className="flex items-center justify-between mb-6">
   

<h2 className="text-lg font-bold text-gray-800">
  {t("dashboard.activityLogs")}
</h2>
 <span className="text-xs bg-[#eefcfc] text-[#00a8a8] px-3 py-1 rounded-full font-bold">
  {logsData?.data?.length || 0} {t("dashboard.logsCount")}
</span>
  </div>

  {logsLoading ? (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-14 rounded-2xl bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  ) : !logsData?.data?.length ? (
    <div className="text-center py-10">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">📄</span>
      </div>

      <p className="text-gray-500 text-sm font-medium">
        {t("noLogs")}
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
        <th className="px-4 py-4 text-start font-semibold">
  {t("dashboard.user")}
</th>

<th className="px-4 py-4 text-start font-semibold">
  {t("dashboard.emailColumn")}
</th>

<th className="px-4 py-4 text-start font-semibold">
  {t("dashboard.role")}
</th>

<th className="px-4 py-4 text-start font-semibold">
  {t("dashboard.action")}
</th>

<th className="px-4 py-4 text-start font-semibold">
  {t("dashboard.statusColumn")}
</th>

<th className="px-4 py-4 text-start font-semibold">
  {t("dashboard.timeColumn")}
</th>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {paginatedLogs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    {log.user.name}
                  </p>

                </div>
              </td>

              <td className="py-4 px-4 text-sm text-gray-600">
                {log.user.email}
              </td>
              
              <td className="py-4 px-4 text-sm font-medium text-gray-700">
                {log.role}
              </td>

              <td className="py-4 px-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-blue-600">
{
    log.action
}
                </span>
              </td>


                            <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    log.user.status === "active"
                      ? "bg-green-50 text-green-600"
                      : log.user.status === "blocked"
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {log.user.status}
              </span>
              </td>

              <td className="py-4 px-4 text-sm text-gray-500">
                {formatSessionTime(
                  log.createdAt,
                  i18n.language
                )}
              </td>


            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={logsCurrentPage}
        totalPages={logsTotalPages}
        totalItems={activityLogs.length}
        itemsPerPage={logsItemsPerPage}
        onPageChange={setLogsCurrentPage}
      />
    </div>
  )}
</div>
    </div>
  );
}
