import { useEffect } from "react";
import { X, Save, Award } from "lucide-react";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "../../contexts/LanguageContext";
import { getRankSchema, RankFormData } from "../../lib/schemas/RankSchema";
import { RankItem } from "../../types/rank";
import { InputNumber, Switch } from "antd";

interface AddRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RankFormData) => Promise<void>;
  initialData?: RankItem | null;
  isLoading?: boolean;
}

export default function AddRankModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: AddRankModalProps) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RankFormData>({
    resolver: zodResolver(getRankSchema(t)) as Resolver<RankFormData>,
    defaultValues: {
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      color: "#369589",
      icon: "",
      minSessions: 0,
      minPoints: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name_ar: initialData.name_ar,
          name_en: initialData.name_en,
          description_ar: initialData.description_ar || "",
          description_en: initialData.description_en || "",
          color: initialData.color || "#369589",
          icon: initialData.icon || "",
          minSessions: initialData.minSessions ?? 0,
          minPoints: initialData.minPoints ?? 0,
          active: initialData.active ?? true,
        });
      } else {
        reset({
          name_ar: "",
          name_en: "",
          description_ar: "",
          description_en: "",
          color: "#369589",
          icon: "",
          minSessions: 0,
          minPoints: 0,
          active: true,
        });
      }
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: RankFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-white" />
            <span>
              {initialData
                ? isRtl
                  ? "تعديل المستوى"
                  : "Edit Rank"
                : isRtl
                ? "إضافة مستوى جديد"
                : "Add New Rank"}
            </span>
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Name AR & EN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "الاسم بالعربية *" : "Name (Arabic) *"}
              </label>
              <input
                type="text"
                {...register("name_ar")}
                placeholder={isRtl ? "مثال: مبتدئ (برونزي)" : "Bronze Rank"}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${
                  errors.name_ar ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name_ar && (
                <p className="text-red-500 text-xs mt-1 text-start">{errors.name_ar.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "الاسم بالإنجليزية *" : "Name (English) *"}
              </label>
              <input
                type="text"
                {...register("name_en")}
                placeholder="Bronze Rank"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${
                  errors.name_en ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name_en && (
                <p className="text-red-500 text-xs mt-1 text-start">{errors.name_en.message}</p>
              )}
            </div>
          </div>

          {/* Description AR & EN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "الوصف بالعربية" : "Description (Arabic)"}
              </label>
              <textarea
                rows={2}
                {...register("description_ar")}
                placeholder={isRtl ? "وصف مختصر للمستوى" : "Brief description"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "الوصف بالإنجليزية" : "Description (English)"}
              </label>
              <textarea
                rows={2}
                {...register("description_en")}
                placeholder="Brief description"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Min Sessions, Min Points, Color */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "الحد الأدنى للحصص *" : "Min Sessions *"}
              </label>
              <Controller
                name="minSessions"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    className="w-full rounded-lg h-10 flex items-center"
                    placeholder="0"
                  />
                )}
              />
              {errors.minSessions && (
                <p className="text-red-500 text-xs mt-1 text-start">{errors.minSessions.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "الحد الأدنى للنقاط *" : "Min Points *"}
              </label>
              <Controller
                name="minPoints"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    className="w-full rounded-lg h-10 flex items-center"
                    placeholder="0"
                  />
                )}
              />
              {errors.minPoints && (
                <p className="text-red-500 text-xs mt-1 text-start">{errors.minPoints.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "لون الشارة *" : "Badge Color *"}
              </label>
              <input
                type="color"
                {...register("color")}
                className="h-10 p-1 cursor-pointer w-full rounded-lg border border-gray-300"
              />
              {errors.color && (
                <p className="text-red-500 text-xs mt-1 text-start">{errors.color.message}</p>
              )}
            </div>
          </div>

          {/* Icon & Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
                {isRtl ? "رابط الأيقونة (اختياري)" : "Icon URL (Optional)"}
              </label>
              <input
                type="text"
                {...register("icon")}
                placeholder="https://example.com/icons/badge.png"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <span className="text-sm font-medium text-gray-700">
                {isRtl ? "تفعيل المستوى" : "Active Status"}
              </span>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    checkedChildren={isRtl ? "مفعل" : "Active"}
                    unCheckedChildren={isRtl ? "معطل" : "Inactive"}
                  />
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>
                {initialData
                  ? isRtl
                    ? "حفظ التعديلات"
                    : "Save Changes"
                  : isRtl
                  ? "إنشاء المستوى"
                  : "Create Rank"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
