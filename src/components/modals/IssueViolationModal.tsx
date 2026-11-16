import { Form, Input, InputNumber, Select, message } from "antd";
import { X, Save, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useViolations, useIssueViolation } from "../../features/admin/hooks/useViolations";
import { useTeacher } from "../../features/admin/hooks/useTeacher";
import { useSearchSchedules } from "../../features/admin/hooks/useSchedules";
import { ViolationItem, IssueViolationPayload } from "../../types/Violations";
import { Teacher } from "../../types/teachers";

interface IssueViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string;
  scheduleId?: string;
}

export default function IssueViolationModal({
  isOpen,
  onClose,
  teacherId,
  scheduleId,
}: IssueViolationModalProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [form] = Form.useForm();
  const { data: violationsData } = useViolations();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeacher({ page: 1, limit: 100 });
  const { data: schedulesData, isLoading: isLoadingSchedules } = useSearchSchedules("", 1, 100);
  const { mutate: issueMutate, isPending: isSubmitting } = useIssueViolation();

  if (!isOpen) return null;

  const violationItems: ViolationItem[] = Array.isArray(violationsData?.data)
    ? violationsData.data
    : (violationsData?.data as any)?.items || [];

  const teachersList: Teacher[] = Array.isArray((teachersData as any)?.teachers)
    ? (teachersData as any).teachers
    : Array.isArray((teachersData as any)?.data?.teachers)
    ? (teachersData as any).data.teachers
    : Array.isArray((teachersData as any)?.data)
    ? (teachersData as any).data
    : Array.isArray(teachersData)
    ? (teachersData as any)
    : [];

  const schedulesList = Array.isArray((schedulesData as any)?.data?.schedule)
    ? (schedulesData as any).data.schedule
    : Array.isArray((schedulesData as any)?.schedule)
    ? (schedulesData as any).schedule
    : Array.isArray((schedulesData as any)?.data?.schedules)
    ? (schedulesData as any).data.schedules
    : Array.isArray((schedulesData as any)?.schedules)
    ? (schedulesData as any).schedules
    : Array.isArray((schedulesData as any)?.data)
    ? (schedulesData as any).data
    : Array.isArray(schedulesData)
    ? (schedulesData as any)
    : [];

  const handleItemSelect = (itemId: string) => {
    const selectedItem = violationItems.find((i) => i.id === itemId);
    if (selectedItem) {
      form.setFieldsValue({
        type: selectedItem.defaultType,
        deductionAmount: selectedItem.defaultDeductionAmount || 0,
        reason: selectedItem.description || "",
      });
    }
  };

  const handleSubmit = (values: any) => {
    const payload: IssueViolationPayload = {
      teacherId: values.teacherId || teacherId,
      scheduleId: values.scheduleId || scheduleId,
      infractionItemId: values.infractionItemId,
      type: values.type,
      deductionAmount: values.deductionAmount || 0,
      reason: values.reason,
    };

    issueMutate(payload, {
      onSuccess: () => {
        message.success(isRtl ? "تم إصدار المخالفة/التحذير بنجاح" : "Violation/Warning issued successfully");
        onClose();
        form.resetFields();
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message || (isRtl ? "فشل إصدار المخالفة/التحذير" : "Failed to issue violation/warning")
        );
      },
    });
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
            <ShieldAlert className="w-6 h-6 text-white" />
            <span>{isRtl ? "إصدار مخالفة / تحذير للمعلم" : "Issue Violation / Warning to Teacher"}</span>
          </h2>
          <button
            onClick={() => {
              onClose();
              form.resetFields();
            }}
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6 space-y-4"
        >
          {!teacherId && (
            <Form.Item
              name="teacherId"
              label={<span className="font-medium text-gray-700">{isRtl ? "اختر المعلم *" : "Select Teacher *"}</span>}
              rules={[{ required: true, message: isRtl ? "يرجى اختيار المعلم" : "Please select teacher" }]}
            >
              <Select
                showSearch
                placeholder={isRtl ? "ابحث عن المعلم..." : "Search teacher..."}
                loading={isLoadingTeachers}
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                }
                options={teachersList.map((t) => ({
                  value: t.id,
                  label: (t as any).name || t.user?.name || (t as any).email || t.user?.email || t.id,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="infractionItemId"
            label={<span className="font-medium text-gray-700">{isRtl ? "اختر بند المخالفة/التحذير *" : "Select Infraction Item *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى اختيار البند" : "Please select infraction item" }]}
          >
            <Select
              placeholder={isRtl ? "اختر البند..." : "Select item..."}
              onChange={handleItemSelect}
              options={violationItems.map((item) => ({
                value: item.id,
                label: `${isRtl ? item.title_ar : item.title_en} (${
                  item.defaultType === "penalty"
                    ? isRtl
                      ? "خصم"
                      : "Penalty"
                    : isRtl
                    ? "تحذير"
                    : "Warning"
                })`,
              }))}
            />
          </Form.Item>

          {!scheduleId && (
            <Form.Item
              name="scheduleId"
              label={<span className="font-medium text-gray-700">{isRtl ? "الحصة المرتبطة (اختياري)" : "Related Schedule (Optional)"}</span>}
            >
              <Select
                showSearch
                allowClear
                placeholder={isRtl ? "اختر الحصة إن وجدت..." : "Select schedule if applicable..."}
                loading={isLoadingSchedules}
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                }
                options={schedulesList.map((s: any) => ({
                  value: s.id,
                  label: `${s.title || "Schedule"} - ${s.start_time ? new Date(s.start_time).toLocaleDateString() : ""}`,
                }))}
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label={<span className="font-medium text-gray-700">{isRtl ? "نوع الإجراء *" : "Action Type *"}</span>}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "warning", label: isRtl ? "تحذير (Warning)" : "Warning" },
                  { value: "penalty", label: isRtl ? "عقوبة / خصم (Penalty)" : "Penalty" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="deductionAmount"
              label={<span className="font-medium text-gray-700">{isRtl ? "مبلغ الخصم (ج.م) *" : "Deduction Amount *"}</span>}
              rules={[{ required: true, message: isRtl ? "يرجى كتابة المبلغ" : "Please enter deduction amount" }]}
            >
              <InputNumber className="w-full rounded-lg" min={0} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            name="reason"
            label={<span className="font-medium text-gray-700">{isRtl ? "السبب والتفاصيل *" : "Reason & Explanation *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى كتابة السبب" : "Please enter reason" }]}
          >
            <Input.TextArea rows={3} className="rounded-lg" placeholder={isRtl ? "أدخل سبب إصدار المخالفة..." : "Enter reason..."} />
          </Form.Item>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                form.resetFields();
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isRtl ? "إصدار المخالفة" : "Issue Violation"}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
