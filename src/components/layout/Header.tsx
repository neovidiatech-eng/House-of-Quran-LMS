import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSettings } from "../../contexts/SettingsContext";
import { disconnectSocket } from "../../utils/socket";
import ThemeToggle from "../ui/ThemeToggle";
interface HeaderProps {
  onMenuClick: () => void;
  userRole: "admin" | "teacher" | "student" | "parent" | "supervisor";
  userName?: string;
  userEmail?: string;
  isCollapsed?: boolean;
}

export default function Header({
  onMenuClick,
  userRole,
  userEmail,
  isCollapsed,
}: HeaderProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { settings } = useSettings();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isRtl = language === "ar";
  const academyName = language === "ar" ? t("academyName") : settings.name;

  const roleSubtitle: Record<"admin" | "teacher" | "student" | "parent" | "supervisor", Record<string, string>> = {
    admin: { ar: "لوحة التحكم", en: "Control Panel" },
    teacher: { ar: "لوحة المعلم", en: "Teacher Panel" },
    student: { ar: "لوحة الطالب", en: "Student Panel" },
    parent: { ar: "لوحة ولي الأمر", en: "Parent Panel" },
    supervisor: { ar: "لوحة المشرف", en: "Supervisor Panel" },
  };

  // const { data: notificationsData } = useNotifications();
  // const { mutate: markAsRead } = useMarkNotificationAsRead();
  // const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  // const { mutate: deleteNotif } = useDeleteNotification();

  // const serverNotifications = notificationsData?.data?.notifications || [];
  // const displayedNotifications = serverNotifications.slice(0, 3);
  // const unreadCount = notificationsData?.data?.unreadCount || 0;

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("platform_settings");
    sessionStorage.removeItem("platform_settings");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("role");
    localStorage.removeItem("email");
    sessionStorage.removeItem("email");
    localStorage.removeItem("permissions");
    sessionStorage.removeItem("permissions");
    window.location.href = "/login";
  };

  let role = localStorage.getItem("role") || userRole;
  let email = localStorage.getItem("email") || userEmail || "";

  if (role === "super_admin" || role === "admin") {
    role = language === "ar" ? "مسؤول النظام" : "Admin";
  } else if (role === "teacher") {
    role = language === "ar" ? "معلم" : "Teacher";
  } else if (role === "student") {
    role = language === "ar" ? "طالب" : "Student";
  } else if (role === "parent") {
    role = language === "ar" ? "ولي أمر" : "Parent";
  } else if (role === "supervisor") {
    role = language === "ar" ? "مشرف" : "Supervisor";
  }

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-all duration-300 ${userRole === "parent"
          ? ""
          : isRtl
            ? isCollapsed
              ? "lg:mr-20"
              : "lg:mr-72"
            : isCollapsed
              ? "lg:ml-20"
              : "lg:ml-72"
        }`}
    >
      <div
        className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? "px-4" : "px-4"} py-3`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden ${userRole === "parent" ? "hidden" : ""}`}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={academyName}
                className="w-10 h-10 rounded-full object-contain"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: settings.primaryColor }}
              >
                {settings.name.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block text-start">
              <h1 className="text-lg font-bold text-gray-900">
                {academyName}
              </h1>
              <p className="text-xs text-gray-500">
                {roleSubtitle[userRole][language]}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {language === "ar" ? "English" : "العربية"}
          </button>
          {/* <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex justify-center items-center text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="fixed top-[70px] ltr:right-4 rtl:left-4 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-start">
                        {language === "ar" ? "الإشعارات" : "Notifications"}
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAllAsRead()}
                          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          {language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {serverNotifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                           {language === "ar" ? "لا توجد إشعارات" : "No notifications"}
                        </div>
                      ) : (
                        displayedNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-start gap-2 ${!notif.isRead ? 'bg-primary-50/50' : ''}`}
                          >
                            <div className="flex-1">
                              <p className={`text-sm text-gray-900 text-start ${!notif.isRead ? 'font-medium' : ''}`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 text-start mt-1">
                                {new Date(notif.createdAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notif.isRead && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                                  title={language === "ar" ? "تحديد كمقروء" : "Mark as read"}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title={language === "ar" ? "حذف" : "Delete"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {serverNotifications.length > 0 && (
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            const basePath = userRole === 'admin' ? '/dashboard' : `/${userRole}-dashboard`;
                            navigate(`${basePath}/notifications`);
                          }}
                          className="w-full text-center py-2 text-sm text-primary-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {language === "ar" ? "رؤية المزيد" : "View All"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div> */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
              <div className="hidden sm:block text-start">
                <p className="text-sm font-semibold text-gray-900">{role}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
            </button>
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div
                  className={`absolute ${isRtl ? "left-0" : "right-0"} mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50`}
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 text-start">
                      {role}
                    </p>
                    <p className="text-xs text-gray-500 text-start">{email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-start hover:bg-red-50 transition-colors flex items-center justify-end gap-2 text-red-600"
                    >
                      <span className="text-sm font-medium">
                        {" "}
                        {t("logout")}
                      </span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
