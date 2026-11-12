import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useState } from "react";
import AddDailyQuranModal from "../../../components/modals/AddDailyQuranModal";
import {
  useCreateDailyQuranRecitation,
  useDailyQuranRecitations,
  useDeleteDailyQuranRecitation,
  useUpdateDailyQuranRecitation,
} from "../hooks/useDailyQuran";
import { DailyQuranFormData } from "../../../lib/schemas/DailyQuranSchema";
import { IDailyQuranRecitation } from "../../../types/dailyQuran";
import { useConfirm } from "../../../hooks/useConfirm";

export default function DailyQuran() {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DailyQuranFormData | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const createDailyQuran = useCreateDailyQuranRecitation();
  const updateDailyQuran = useUpdateDailyQuranRecitation();
  const deleteDailyQuran = useDeleteDailyQuranRecitation();
  const { data, isLoading, isError } = useDailyQuranRecitations();
  const { confirm, ConfirmDialog } = useConfirm();

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: IDailyQuranRecitation) => {
    setEditingId(item.id);
    setEditingItem({
      studentId: item.studentId,
      surah: item.surah,
      startPage: item.startPage,
      endPage: item.endPage,
      dueDate: item.dueDate
        ? new Date(item.dueDate).toISOString().split("T")[0]
        : "",
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSave = async (formData: DailyQuranFormData) => {
    try {
      if (editingId) {
        await updateDailyQuran.mutateAsync({
          id: editingId,
          payload: {
            surah: formData.surah,
            startPage: formData.startPage,
            endPage: formData.endPage,
            dueDate: new Date(formData.dueDate).toISOString(),
            status: formData.status,
          },
        });
      } else {
        await createDailyQuran.mutateAsync({
          studentId: formData.studentId,
          surah: formData.surah,
          startPage: formData.startPage,
          endPage: formData.endPage,
          dueDate: new Date(formData.dueDate).toISOString(),
          status: formData.status,
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: language === "ar" ? "حذف" : "Delete",
      message: language === "ar" ? "هل أنت متأكد من حذف هذا الورد؟" : "Are you sure you want to delete this recitation?",
    });
    if (ok) {
      try {
        await deleteDailyQuran.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const recitations: IDailyQuranRecitation[] = data?.data?.recitations ?? [];

  const filteredRecitations = recitations.filter((item) => {
    const term = searchTerm.toLowerCase();
    const studentName = (item.student?.user?.name || "").toLowerCase();
    const surah = item.surah.toLowerCase();
    return studentName.includes(term) || surah.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === "ar" ? "الورد اليومي" : "Daily Quran Recitation"}
        </h1>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl"
        >
          <Plus className="w-5 h-5" />
          {language === "ar" ? "إضافة ورد يومي" : "Add Daily Quran"}
        </button>
      </div>

      <AddDailyQuranModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onAdd={handleSave}
        initialData={editingItem}
      />

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={language === "ar" ? "ابحث باسم الطالب أو السورة..." : "Search by student or surah..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* TABLE */}
      {isLoading && <div className="p-10 text-center">Loading...</div>}
      {isError && <div className="p-10 text-red-500">Error loading data</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-center">
                  {language === "ar" ? "الطالب" : "Student"}
                </th>
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
                <th className="px-6 py-4 text-center">
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecitations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    {language === "ar" ? "لا توجد بيانات" : "No data found"}
                  </td>
                </tr>
              ) : (
                filteredRecitations.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      {item.student?.user?.name || item.studentId}
                    </td>
                    <td className="px-6 py-4 text-center">{item.surah}</td>
                    <td className="px-6 py-4 text-center">
                      {item.startPage} - {item.endPage}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.dueDate
                        ? new Date(item.dueDate).toISOString().split("T")[0]
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const map: Record<string, { ar: string; en: string; cls: string }> = {
                          pending:   { ar: "قيد الانتظار", en: "Pending",   cls: "bg-yellow-100 text-yellow-800" },
                          completed: { ar: "مكتمل",       en: "Completed", cls: "bg-blue-100 text-blue-800" },
                          reviewed:  { ar: "تمت المراجعة",en: "Reviewed",  cls: "bg-green-100 text-green-800" },
                          rejected:  { ar: "مرفوض",       en: "Rejected",  cls: "bg-red-100 text-red-800" },
                        };
                        const s = map[item.status] ?? map.pending;
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                            {language === "ar" ? s.ar : s.en}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 icon-btn-primary rounded-lg"
                          title={language === "ar" ? "تعديل" : "Edit"}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteDailyQuran.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={language === "ar" ? "حذف" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {ConfirmDialog}
    </div>
  );
}
