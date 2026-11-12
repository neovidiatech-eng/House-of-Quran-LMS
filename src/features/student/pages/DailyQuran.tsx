import { Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useMyRecitations } from "../hooks/useDailyQuran";
import { IDailyQuranRecitation } from "../../../types/dailyQuran";

const STATUS_MAP: Record<
  string,
  { ar: string; en: string; cls: string }
> = {
  pending:   { ar: "قيد الانتظار", en: "Pending",   cls: "bg-yellow-100 text-yellow-800" },
  completed: { ar: "مكتمل",        en: "Completed", cls: "bg-blue-100 text-blue-800" },
  reviewed:  { ar: "تمت المراجعة", en: "Reviewed",  cls: "bg-green-100 text-green-800" },
  rejected:  { ar: "مرفوض",        en: "Rejected",  cls: "bg-red-100 text-red-800" },
};

export default function DailyQuran() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useMyRecitations();

  const recitations: IDailyQuranRecitation[] =
    data?.data?.recitations ?? [];

  const filtered = recitations.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.surah.toLowerCase().includes(term) ||
      (item.student?.user?.name ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === "ar" ? "الورد اليومي" : "Daily Quran Recitation"}
        </h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={
              language === "ar"
                ? "ابحث باسم السورة..."
                : "Search by surah..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading && <div className="p-10 text-center">Loading...</div>}
      {isError && <div className="p-10 text-red-500">Error loading data</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-center">
                  {language === "ar" ? "السورة" : "Surah"}
                </th>
                <th className="px-6 py-4 text-center">
                  {language === "ar" ? "الصفحات" : "Pages"}
                </th>
                <th className="px-6 py-4 text-center">
                  {language === "ar" ? "تاريخ التسليم" : "Due Date"}
                </th>
                <th className="px-6 py-4 text-center">
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    {language === "ar" ? "لا توجد بيانات" : "No data found"}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const s =
                    STATUS_MAP[item.status] ?? STATUS_MAP.pending;
                  return (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-center">
                        {item.surah}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.startPage} - {item.endPage}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.dueDate
                          ? new Date(item.dueDate)
                              .toISOString()
                              .split("T")[0]
                          : ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${s.cls}`}
                        >
                          {language === "ar" ? s.ar : s.en}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
