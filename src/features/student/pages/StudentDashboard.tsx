import {
  FileText,
  Users,
  NotebookPenIcon,
  VideotapeIcon,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { Outlet, Routes, Route } from "react-router-dom";

import SubscribePlanModal from "../../../components/modals/SubscribePlanModal";
import StudentDashboardLayout from "../../../pages/StudentDashboard/StudentDashboardLayout";
import { studentDashboardRoutes } from "../../../pages/StudentDashboard/studentDashboardRoutes";
import DashboardCard from "../../../components/ui/Card";

import { useSettings } from "../../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import { useStudentDashboard } from "../hooks/useProfile";

export default function StudentDashboard() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const { settings } = useSettings();
  const { i18n } = useTranslation();

  const isRtl = i18n.language.split("-")[0] === "ar";

  const { data: dashboard } = useStudentDashboard();

  const stats = dashboard?.stats;
  const upcomingSessions = dashboard?.todaySchedules;
  const student = dashboard?.student;

  const renderStudentHome = () => (
    <div className="space-y-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.accentColor})`,
        }}
      >
        <h1 className="text-2xl font-bold text-white">
          أهلا بك! {student?.name}
        </h1>

        <div className="flex items-center gap-2 text-white mt-2">
          <Calendar size={16} />

          <span className="text-sm">
            {new Intl.DateTimeFormat("ar-EG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {student?.plan?.name_ar}
          </span>

          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {student?.email}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mx-3 gap-6">
        <DashboardCard
          title="الحصص"
          value={stats?.sessions.total?.toString() || "0"}
          unit="حصة"
          percentage="0"
          isIncrease={true}
          subText={`المتبقي ${stats?.sessions.remaining || 0}`}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: <Users size={20} className="text-[#00a8a8]" />,
          }}
        />

        <DashboardCard
          title="الواجبات"
          value={stats?.homeworks.total?.toString() || "0"}
          unit="واجب"
          percentage="0"
          isIncrease={true}
          subText={`المعلق ${stats?.homeworks.pending || 0}`}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: (
              <NotebookPenIcon size={20} className="text-[#00a8a8]" />
            ),
          }}
        />

        <DashboardCard
          title="الامتحانات"
          value={stats?.exams.total?.toString() || "0"}
          unit="امتحان"
          percentage="0"
          isIncrease={true}
          subText={`المعلق ${stats?.exams.pending || 0}`}
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: <FileText size={20} className="text-[#00a8a8]" />,
          }}
        />

        <DashboardCard
          title="الكورسات"
          value={stats?.courses.total?.toString() || "0"}
          unit="كورس"
          percentage="0"
          isIncrease={true}
          subText="إجمالي الكورسات"
          icon={{
            bgColor: "bg-[#eefcfc]",
            svg: (
              <VideotapeIcon size={20} className="text-[#00a8a8]" />
            ),
          }}
        />
      </div>

      {/* Today Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar
            className="w-5 h-5"
            style={{ color: settings.primaryColor }}
          />

          {isRtl ? "جدول اليوم" : "Today Schedule"}
        </h2>

        <div className="space-y-4">
          {upcomingSessions?.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-lg"
                  style={{ color: settings.primaryColor }}
                >
                  {session.teacher.user.name.substring(0, 1)}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">
                    {session.teacher.user.name}
                  </h4>

                  <p className="text-sm text-gray-500">
                    {isRtl
                      ? session.subject.name_ar
                      : session.subject.name_en}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {session.title}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 mb-1">
                  {new Date(session.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <p
                  className={`text-xs font-medium ${
                    session.status === "ongoing"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {session.status}
                </p>
              </div>
            </div>
          ))}

          {upcomingSessions?.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              لا يوجد حصص اليوم
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <StudentDashboardLayout>
        <Routes>
          <Route index element={renderStudentHome()} />

          {studentDashboardRoutes.flatMap((route) => {
            if (route.subItems) {
              return route.subItems.map((subItem) => (
                <Route
                  key={subItem.id}
                  path={subItem.path}
                  element={subItem.element}
                />
              ));
            }

            return route.element
              ? [
                  <Route
                    key={route.id}
                    path={route.path}
                    element={route.element}
                  />,
                ]
              : [];
          })}
        </Routes>

        <Outlet />
      </StudentDashboardLayout>

      <SubscribePlanModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />
    </>
  );
}