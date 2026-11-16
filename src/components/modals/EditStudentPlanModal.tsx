import { useEffect } from "react";
import { X, CreditCard, Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useLanguage } from "../../contexts/LanguageContext";
import { Student } from "../../types/student";
import { usePlans } from "../../features/admin/hooks/usePlans";
import { useUpdateStudentPlan } from "../../features/admin/hooks/useStudents";
import { Plan } from "../../types/plan";
import { Select } from "antd";

interface EditStudentPlanModalProps {
  isOpen?: boolean;
  onClose: () => void;
  student?: Student | null;
  onSubmit?: (studentId: string, planId: string) => Promise<void>;
  isLoading?: boolean;
}

interface FormValues {
  planId: string;
}

export default function EditStudentPlanModal({
  isOpen = true,
  onClose,
  student,
  onSubmit,
  isLoading: externalLoading = false,
}: EditStudentPlanModalProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const { data: plansData, isLoading: isPlansLoading } = usePlans();
  const updateStudentPlanMutation = useUpdateStudentPlan();

  const isSubmitting = externalLoading || updateStudentPlanMutation.isPending;

  const currentPlan = student?.plan;
  const currentPlanName = currentPlan
    ? isRtl
      ? currentPlan.name_ar
      : currentPlan.name_en
    : null;

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      planId: student?.planId || student?.plan?.id || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        planId: student?.planId || student?.plan?.id || "",
      });
    }
  }, [isOpen, student, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: FormValues) => {
    if (!student?.id) return;
    if (onSubmit) {
      await onSubmit(student.id, data.planId);
    } else {
      await updateStudentPlanMutation.mutateAsync({
        id: student.id,
        planId: data.planId,
      });
    }
    onClose();
  };

  const planOptions = (plansData || []).map((plan: Plan) => ({
    value: plan.id,
    label: `${isRtl ? plan.name_ar : plan.name_en} - (${
      plan.sessionsCount || 0
    } ${isRtl ? "حصة" : "sessions"} | ${plan.price || 0} ${
      plan.currency?.symbol || "EGP"
    })`,
  }));

  const text = {
    title: { ar: "تعديل باقة الطالب", en: "Edit Student Plan" },
    student: { ar: "الطالب", en: "Student" },
    currentPlan: { ar: "الباقة الحالية", en: "Current Plan" },
    noPlan: { ar: "بدون باقة حالية", en: "No active plan" },
    selectPlan: { ar: "اختر الباقة الجديدة *", en: "Select New Plan *" },
    placeholder: { ar: "اختر الباقة...", en: "Select plan..." },
    cancel: { ar: "إلغاء", en: "Cancel" },
    save: { ar: "حفظ التغييرات", en: "Save Changes" },
    required: { ar: "يرجى اختيار الباقة", en: "Please select a plan" },
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl z-50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-white" />
            <span>{text.title[language]}</span>
          </h2>

          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Student Info Card */}
          {student && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{text.student[language]}:</span>
                <span className="font-semibold text-gray-900">
                  {student.user?.name || "Student"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{text.currentPlan[language]}:</span>
                <span className={`font-semibold ${currentPlanName ? "text-primary" : "text-gray-400"}`}>
                  {currentPlanName || text.noPlan[language]}
                </span>
              </div>
            </div>
          )}

          {/* Select New Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.selectPlan[language]}
            </label>
            <Controller
              name="planId"
              control={control}
              rules={{ required: text.required[language] }}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  loading={isPlansLoading}
                  placeholder={text.placeholder[language]}
                  className="w-full text-start"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={planOptions}
                />
              )}
            />
            {errors.planId && (
              <p className="text-red-500 text-xs mt-1.5 text-start">
                {errors.planId.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? text.save[language] : text.save[language]}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
