import { Bell, Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSettings } from "../../contexts/SettingsContext";
import { disconnectSocket } from "../../utils/socket";

interface HeaderProps {
  onMenuClick: () => void;
  userRole: "admin" | "teacher" | "student"| "parent";
  userName: string;
  userEmail: string;
  isCollapsed?: boolean;
}

export default function Header({
  onMenuClick,
  userRole,
  isCollapsed,
}: HeaderProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { settings } = useSettings();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isRtl = language === "ar";
  const academyName = language === "ar" ? "أكاديمية بيت القران" : "House Of Quran Academy";

  const roleSubtitle: Record<"admin" | "teacher" | "student" | "parent", Record<string, string>> = {
    admin: { ar: "لوحة التحكم", en: "Control Panel" },
    teacher: { ar: "لوحة المعلم", en: "Teacher Panel" },
    student: { ar: "لوحة الطالب", en: "Student Panel" },
    parent: { ar: "لوحة ولي الأمر", en: "Parent Panel" },
  };

  const notifications = [
    { id: 1, text: "طالب جديد قام بالتسجيل", time: "5 دقائق" },
    { id: 2, text: "تم إضافة حصة جديدة", time: "30 دقيقة" },
    { id: 3, text: "معلم جديد في انتظار الموافقة", time: "ساعة واحدة" },
  ];

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

  let role = localStorage.getItem("role");
  let email = localStorage.getItem("email");
  if (role === "super_admin") {
    role = "Super Admin";
  }

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-all duration-300 ${role === "parent" ?"!ms-0" : ""} ${
        isRtl
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src={settings.logoUrl || "/logo.jpeg"}
              alt="House Of Quran Academy Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
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
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {language === "ar" ? "English" : "العربية"}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="fixed top-[70px] ltr:right-4 rtl:left-4 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-start">
                      الإشعارات
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-gray-900 text-start">
                          {notif.text}
                        </p>
                        <p className="text-xs text-gray-500 text-start mt-1">
                          منذ {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
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
