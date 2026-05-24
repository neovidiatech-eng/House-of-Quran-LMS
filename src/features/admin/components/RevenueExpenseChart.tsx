import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { SessionPerDay } from "../../../types/AdminDasboard";

interface RevenueExpenseChartProps {
  sessionsData?: SessionPerDay[];
}

export default function RevenueExpenseChart({ sessionsData }: RevenueExpenseChartProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split("-")[0];
  const locale = language === "ar" ? "ar-EG" : "en-US";
  const isSessions = Boolean(sessionsData && sessionsData.length > 0);

  const defaultMonthlyData = [
    { month: t("dashboard.november"), revenue: 190, expenses: 130 },
    { month: t("dashboard.december"), revenue: 220, expenses: 140 },
    { month: t("dashboard.january"), revenue: 250, expenses: 145 },
    { month: t("dashboard.february"), revenue: 280, expenses: 150 },
    { month: t("dashboard.march"), revenue: 300, expenses: 155 },
    { month: t("dashboard.april"), revenue: 320, expenses: 148 },
  ];

  const chartData = isSessions
    ? sessionsData!.map((d) => {
        let displayDate = d.date;

        try {
          const dateObj = new Date(d.date);
          if (!isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString(locale, { day: "numeric", month: "short" });
          }
        } catch {
          // Keep the original value when the API date is not parseable.
        }

        return {
          name: displayDate,
          count: d.count,
        };
      })
    : [];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        {isSessions ? (
          <div className="flex items-center gap-4 order-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00a8a8]" />
              <span className="text-gray-500 text-xs font-medium">{t("dashboard.sessionsCount")}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 order-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-gray-500 text-xs font-medium">{t("dashboard.revenue")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span className="text-gray-500 text-xs font-medium">{t("dashboard.expenses")}</span>
            </div>
          </div>
        )}

        <div className="text-right order-2">
          <h2 className="text-xl font-bold text-gray-800">
            {isSessions ? t("dashboard.dailySessionActivity") : t("dashboard.revenueVsExpenses")}
          </h2>
          <p className="text-gray-400 text-sm">
            {isSessions ? t("dashboard.latestActiveDays") : t("dashboard.lastSixMonths")}
          </p>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {isSessions ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00a8a8"
                strokeWidth={3}
                fill="url(#colorSessions)"
                name={t("dashboard.sessionsCount")}
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a8a8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00a8a8" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          ) : (
            <AreaChart data={defaultMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickFormatter={(value) => `${value}${t("dashboard.thousandSuffix")}`}
                ticks={[0, 75, 150, 225, 300]}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={4}
                fill="url(#colorRevenue)"
                name={t("dashboard.revenue")}
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f59e0b"
                strokeWidth={4}
                fill="url(#colorExpenses)"
                name={t("dashboard.expenses")}
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
