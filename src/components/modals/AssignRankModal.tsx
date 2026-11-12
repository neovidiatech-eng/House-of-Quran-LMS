import { useEffect } from "react";
import { X, UserCheck, Save } from "lucide-react";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "../../contexts/LanguageContext";
import { getAssignRankSchema, AssignRankFormData } from "../../lib/schemas/RankSchema";
import { RankItem } from "../../types/rank";
import { Select } from "antd";

interface AssignRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignRankFormData) => Promise<void>;
  ranks: RankItem[];
  students: any[];
  initialRankId?: string | null;
  isLoading?: boolean;
  isStudentsLoading?: boolean;
}

export default function AssignRankModal({
  isOpen,
  onClose,
  onSubmit,
  ranks,
  students,
  initialRankId,
  isLoading = false,
  isStudentsLoading = false,
}: AssignRankModalProps) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AssignRankFormData>({
    resolver: zodResolver(getAssignRankSchema(t)) as Resolver<AssignRankFormData>,
    defaultValues: {
      studentId: "",
      rankId: initialRankId || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        studentId: "",
        rankId: initialRankId || "",
      });
    }
  }, [initialRankId, isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: AssignRankFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-white" />
            <span>{isRtl ? "تعيين مستوى يدوياً لطالب" : "Assign Rank to Student"}</span>
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
          {/* Select Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {isRtl ? "اختر الطالب *" : "Select Student *"}
            </label>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder={isRtl ? "ابحث باسم الطالب..." : "Search student..."}
                  loading={isStudentsLoading}
                  className="w-full"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={students.map((std: any) => ({
                    value: std.id,
                    label: `${std.name || std.user?.name || "Student"} - (${
                      std.email || std.user?.email || std.id
                    })`,
                  }))}
                />
              )}
            />
            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1 text-start">{errors.studentId.message}</p>
            )}
          </div>

          {/* Select Rank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {isRtl ? "اختر المستوى المراد تعيينه *" : "Select Target Rank *"}
            </label>
            <Controller
              name="rankId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={isRtl ? "اختر المستوى..." : "Select rank..."}
                  className="w-full"
                  options={ranks.map((r) => ({
                    value: r.id,
                    label: `${isRtl ? r.name_ar : r.name_en} (${
                      isRtl ? "حصص" : "Sessions"
                    }: ${r.minSessions} | ${isRtl ? "نقاط" : "Points"}: ${r.minPoints})`,
                  }))}
                />
              )}
            />
            {errors.rankId && (
              <p className="text-red-500 text-xs mt-1 text-start">{errors.rankId.message}</p>
            )}
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
              <span>{isRtl ? "تأكيد التعيين" : "Confirm Assignment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
