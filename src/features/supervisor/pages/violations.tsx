import { Table, Tag, Card, Alert, Spin } from "antd";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useViolations } from "../hooks/useViolations";

export default function Violations() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  
  const { data, isLoading, isError, error } = useViolations();
  
  const violations = data?.data?.violations || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      title: isRtl ? "بند المخالفة" : "Infraction Item",
      key: "infractionItem",
      render: (_: any, record: any) => (
        <span className="text-gray-800 font-medium text-sm">
          {isRtl
            ? record.infractionItem?.title_ar
            : record.infractionItem?.title_en || "-"}
        </span>
      ),
    },
    {
      title: isRtl ? "النوع" : "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "penalty" ? "red" : "gold"} className="px-2 py-0.5 font-medium">
          {type === "penalty"
            ? isRtl ? "مخالفة / خصم" : "Penalty"
            : isRtl ? "تحذير" : "Warning"}
        </Tag>
      ),
    },
    {
      title: isRtl ? "قيمة الخصم" : "Deduction",
      dataIndex: "deductionAmount",
      key: "deductionAmount",
      render: (amount: number) => (
        <span className="font-bold text-red-600">
          {amount > 0 ? `${amount} ${isRtl ? "ج.م" : "EGP"}` : isRtl ? "بدون خصم" : "No deduction"}
        </span>
      ),
    },
    {
      title: isRtl ? "السبب" : "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => (
        <span className="text-gray-600 text-sm max-w-[200px] truncate block" title={text}>
          {text || "-"}
        </span>
      ),
    },
    {
      title: isRtl ? "المشرف الصادر عنه" : "Issued By",
      key: "supervisor",
      render: (_: any, record: any) => (
        <span className="text-gray-700 text-sm">{record.supervisor?.name || "-"}</span>
      ),
    },
    {
      title: isRtl ? "تاريخ الإصدار" : "Issued At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (dateStr: string) =>
        dateStr
          ? new Date(dateStr).toLocaleString(isRtl ? "ar-EG" : "en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "-",
    },
  ];

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? "المخالفات الخاصة بي" : "My Violations"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRtl
              ? "سجل المخالفات والتحذيرات الصادرة بحقك"
              : "History of violations and warnings issued to you"}
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-2xl">
        {isError && (
          <Alert
            type="error"
            message={isRtl ? "حدث خطأ أثناء جلب المخالفات" : "Failed to load violations"}
            description={(error as any)?.message || ""}
            showIcon
            className="mb-4"
          />
        )}
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={violations}
            rowKey="id"
            pagination={{
              pageSize: 10,
              total: pagination?.totalItems ?? violations.length,
              showSizeChanger: false,
            }}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-4xl">🛡️</span>
                  <p className="text-sm font-medium">
                    {isRtl ? "لا توجد مخالفات مسجلة بحقك" : "No violations recorded against you"}
                  </p>
                </div>
              ),
            }}
          />
        </Spin>
      </Card>
    </div>
  );
}
