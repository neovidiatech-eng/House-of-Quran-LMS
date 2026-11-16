import { X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomSelect from "../ui/CustomSelect";
import DatePickerField from "../ui/DatePickerField";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DailyQuranFormData,
  getDailyQuranSchema,
} from "../../lib/schemas/DailyQuranSchema";
import { useEffect } from "react";
import { useStudents } from "../../features/admin/hooks/useStudents";

interface AddDailyQuranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: DailyQuranFormData) => void;
  initialData?: DailyQuranFormData | null;
}

const STATUS_OPTIONS = [
  { value: "pending", label_ar: "قيد الانتظار", label_en: "Pending" },
  { value: "completed", label_ar: "مكتمل", label_en: "Completed" },
  { value: "reviewed", label_ar: "تمت المراجعة", label_en: "Reviewed" },
  { value: "rejected", label_ar: "مرفوض", label_en: "Rejected" },
];

export default function AddDailyQuranModal({
  isOpen,
  onClose,
  onAdd,
  initialData,
}: AddDailyQuranModalProps) {
  const { language, t } = useLanguage();
  const { data: studentsData } = useStudents({ limit: 1000 });

  const students =
    studentsData?.data?.studentsData?.map((s: any) => ({
      value: s?.id || s?.studentId || s?.user?.id,
      label: s?.name || s?.user?.name,
      searchText: s?.name || s?.user?.name || "",
    })) || [];

  const isEdit = !!initialData;

  const text = {
    title: {
      ar: isEdit ? "تعديل الورد اليومي" : "إضافة ورد يومي جديد",
      en: isEdit ? "Edit Daily Quran" : "Add New Daily Quran",
    },
    student: { ar: "اختر الطالب", en: "Select Student" },
    surah: { ar: "اسم السورة", en: "Surah Name" },
    startPage: { ar: "الصفحة الأولى", en: "Start Page" },
    endPage: { ar: "الصفحة الأخيرة", en: "End Page" },
    dueDate: { ar: "تاريخ التسليم", en: "Due Date" },
    status: { ar: "الحالة", en: "Status" },
    cancel: { ar: "إلغاء", en: "Cancel" },
    submit: {
      ar: isEdit ? "حفظ التعديلات" : "إضافة",
      en: isEdit ? "Save Changes" : "Add",
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DailyQuranFormData>({
    resolver: zodResolver(
      getDailyQuranSchema(t)
    ) as Resolver<DailyQuranFormData>,
    defaultValues: { status: "pending" },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          studentId: "",
          surah: "",
          startPage: undefined,
          endPage: undefined,
          dueDate: "",
          status: "pending",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleOnSubmit = (data: DailyQuranFormData) => {
    onAdd(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-50">
          <h2 className="text-2xl font-bold text-white">
            {text.title[language]}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleOnSubmit)}
          className="p-6 space-y-4"
          dir="rtl"
        >
          {/* Student - disabled in edit mode */}
          <div>
            <CustomSelect
              label={text.student[language]}
              value={watch("studentId")}
              onChange={(value) =>
                setValue("studentId", value, { shouldValidate: true })
              }
              options={students}
              disabled={isEdit}
            />
            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.studentId.message}
              </p>
            )}
          </div>

          {/* Surah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.surah[language]}
            </label>
            <input
              type="text"
              {...register("surah")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start"
              dir="rtl"
            />
            {errors.surah && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.surah.message}
              </p>
            )}
          </div>

          {/* Start & End Page */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.startPage[language]}
              </label>
              <input
                type="number"
                min="1"
                {...register("startPage")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start"
              />
              {errors.startPage && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.startPage.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.endPage[language]}
              </label>
              <input
                type="number"
                min="1"
                {...register("endPage")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start"
              />
              {errors.endPage && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.endPage.message}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <DatePickerField
              label={text.dueDate[language]}
              value={watch("dueDate")}
              onChange={(val) =>
                setValue("dueDate", val, { shouldValidate: true })
              }
              error={errors.dueDate?.message}
            />
          </div>

          {/* Status */}
          <div>
            <CustomSelect
              label={text.status[language]}
              value={watch("status")}
              onChange={(value) =>
                setValue(
                  "status",
                  value as "pending" | "completed" | "reviewed" | "rejected",
                  { shouldValidate: true }
                )
              }
              options={STATUS_OPTIONS.map((s) => ({
                value: s.value,
                label: language === "ar" ? s.label_ar : s.label_en,
                searchText: s.label_ar + " " + s.label_en,
              }))}
            />
            {errors.status && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
            >
              {text.submit[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
