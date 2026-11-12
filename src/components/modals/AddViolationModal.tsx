import { Form, Input, InputNumber, Select, message } from "antd";
import { X, Save, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCreateViolation } from "../../features/admin/hooks/useViolations";
import { CreateViolationPayload } from "../../types/Violations";

interface AddViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddViolationModal({ isOpen, onClose }: AddViolationModalProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [form] = Form.useForm();
  const { mutate: createViolationMutate, isPending: isSubmitting } = useCreateViolation();

  if (!isOpen) return null;

  const handleCreate = (values: any) => {
    const payload: CreateViolationPayload = {
      title_ar: values.title_ar,
      title_en: values.title_en,
      description: values.description,
      defaultType: values.defaultType,
      defaultDeductionAmount: values.defaultDeductionAmount || 0,
    };

    createViolationMutate(payload, {
      onSuccess: () => {
        message.success(isRtl ? "تمت إضافة بند المخالفة بنجاح" : "Violation item added successfully");
        onClose();
        form.resetFields();
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message || (isRtl ? "فشل إضافة بند المخالفة" : "Failed to add violation item")
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
            <span>{isRtl ? "إضافة بند مخالفة جديد" : "Create Infraction Item"}</span>
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

        {/* Body Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="p-6 space-y-4"
        >
          <Form.Item
            name="title_ar"
            label={<span className="font-medium text-gray-700">{isRtl ? "العنوان بالعربية *" : "Title (Arabic) *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى كتابة العنوان بالعربية" : "Please enter Arabic title" }]}
          >
            <Input className="rounded-lg py-2" placeholder={isRtl ? "مثال: عدم الالتزام بالزي المناسب" : "e.g. Inappropriate Appearance"} />
          </Form.Item>

          <Form.Item
            name="title_en"
            label={<span className="font-medium text-gray-700">{isRtl ? "العنوان بالإنجليزية *" : "Title (English) *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى كتابة العنوان بالإنجليزية" : "Please enter English title" }]}
          >
            <Input className="rounded-lg py-2" placeholder={isRtl ? "مثال: Inappropriate Appearance" : "e.g. Inappropriate Appearance"} />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="defaultType"
              label={<span className="font-medium text-gray-700">{isRtl ? "النوع الافتراضي *" : "Default Type *"}</span>}
              initialValue="warning"
              rules={[{ required: true }]}
            >
              <Select
                className="w-full"
                options={[
                  { value: "warning", label: isRtl ? "تحذير (Warning)" : "Warning" },
                  { value: "penalty", label: isRtl ? "عقوبة / خصم (Penalty)" : "Penalty" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="defaultDeductionAmount"
              label={<span className="font-medium text-gray-700">{isRtl ? "مبلغ الخصم الافتراضي *" : "Default Deduction Amount *"}</span>}
              initialValue={0}
              rules={[{ required: true, message: isRtl ? "يرجى كتابة المبلغ" : "Please enter deduction amount" }]}
            >
              <InputNumber className="w-full rounded-lg" min={0} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="font-medium text-gray-700">{isRtl ? "الوصف" : "Description"}</span>}
          >
            <Input.TextArea rows={3} className="rounded-lg" placeholder={isRtl ? "وصف تفصيلي للبند..." : "Detailed description..."} />
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
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isRtl ? "إضافة البند" : "Create Item"}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
