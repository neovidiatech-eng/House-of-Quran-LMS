import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { ActiveUsers } from "../../../types/AdminDasboard";

interface ActiveUsersChartProps {
  activeUsers?: ActiveUsers;
}

const COLORS = {
  students: "#00a8a8",
  instructors: "#daad15",
};

export default function ActiveUsersChart({ activeUsers }: ActiveUsersChartProps) {
  const { t } = useTranslation();
  const students = activeUsers?.students ?? 0;
  const instructors = activeUsers?.instructors ?? 0;
  const total = students + instructors;

  const chartData = [
    { name: t("dashboard.students"), value: students, color: COLORS.students },
    { name: t("dashboard.instructors"), value: instructors, color: COLORS.instructors },
  ];

  const studentsPercent = total > 0 ? Math.round((students / total) * 100) : 0;
  const instructorsPercent = total > 0 ? 100 - studentsPercent : 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center h-full">
      <div className="w-full flex justify-end items-start mb-6">
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">{t("dashboard.activeUsers")}</h2>
          <p className="text-gray-400 text-sm">{t("dashboard.activeUsersSubtitle")}</p>
        </div>
      </div>

      <div className="relative w-full h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={total === 0 ? 0 : 5}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown, name: unknown) => [`${value} ${t("dashboard.user")}`, name]}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-xs font-medium">{t("dashboard.total")}</span>
          <span className="text-3xl font-black text-gray-900">{total}</span>
          <span className="text-gray-400 text-[11px] mt-0.5">{t("dashboard.activeUser")}</span>
        </div>
      </div>

      <div className="w-full mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 order-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.students }} />
            <span className="text-gray-600 font-medium">{t("dashboard.students")}</span>
          </div>
          <div className="flex items-center gap-2 order-1">
            <span className="text-gray-800 font-black text-base">{students}</span>
            <span className="text-gray-400 text-xs">({studentsPercent}%)</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${studentsPercent}%`, backgroundColor: COLORS.students }}
          />
        </div>

        <div className="flex items-center justify-between text-sm mt-3">
          <div className="flex items-center gap-2 order-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.instructors }} />
            <span className="text-gray-600 font-medium">{t("dashboard.instructors")}</span>
          </div>
          <div className="flex items-center gap-2 order-1">
            <span className="text-gray-800 font-black text-base">{instructors}</span>
            <span className="text-gray-400 text-xs">({instructorsPercent}%)</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${instructorsPercent}%`, backgroundColor: COLORS.instructors }}
          />
        </div>
      </div>
    </div>
  );
}
