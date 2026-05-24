import { useTranslation } from "react-i18next";
import { ActivityFeedItem } from "../../../types/AdminDasboard";

interface RecentActivityProps {
  activities?: ActivityFeedItem[];
}

const formatRelativeTime = (isoString: string, locale: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const diffMs = Date.now() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffSecs < 60) return rtf.format(-diffSecs, "second");

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return rtf.format(-diffMins, "minute");

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return rtf.format(-diffHours, "hour");

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return rtf.format(-diffDays, "day");

    return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return isoString;
  }
};

const getActivityColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "student":
    case "student_register":
      return "bg-primary-500";
    case "teacher":
    case "teacher_register":
      return "bg-green-500";
    case "session":
    case "session_create":
    case "class":
      return "bg-orange-400";
    default:
      return "bg-[#00a8a8]";
  }
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split("-")[0];
  const locale = language === "ar" ? "ar-EG" : "en-US";
  const displayActivities = activities && activities.length > 0 ? activities : [];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-gray-800 text-right">{t("dashboard.recentActivity")}</h2>
      </div>

      {displayActivities.length > 0 ? (
        <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:right-[3px] before:w-[2px] before:bg-gray-100">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="relative flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} ring-4 ring-white z-10 shrink-0 mt-1.5`} />
              <div className="text-right flex-grow">
                <h4 className="text-sm font-bold text-gray-900">{activity.title}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{activity.user}</p>
                <span className="block text-[10px] text-gray-400 mt-1.5">{formatRelativeTime(activity.time, locale)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-gray-500 text-sm font-medium">{t("dashboard.noRecentActivity")}</p>
        </div>
      )}
    </div>
  );
}
