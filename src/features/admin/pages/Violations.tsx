import { useState } from "react";
import { Table, Tag, Card, Row, Col, Select, Spin, Alert, Button, message, Form, Input, InputNumber } from "antd";
import { ShieldAlert, AlertTriangle, CheckCircle, Filter, Plus, History, List, Trash2, UserCheck, X, Save } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  useViolations,
  useAllViolationsHistory,
  useDeleteViolationItem,
  useGetModeratorViolations,
  useCreateModeratorViolations,
  useDeleteModeratorViolation,
} from "../hooks/useViolations";
import { ViolationItem, IssuedViolationHistoryItem, ViolationType } from "../../../types/Violations";
import { ModeratorViolation, IssueModeratorViolationPayload } from "../../../types/moderatorViolations";
import AddViolationModal from "../../../components/modals/AddViolationModal";
import IssueViolationModal from "../../../components/modals/IssueViolationModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { useAllModerators } from "../hooks/useModerator";

export default function Violations() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<"items" | "history" | "moderator">("items");

  // ── Items tab state ──
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ViolationItem | null>(null);

  // ── History tab state ──
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("all");
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyLimit] = useState<number>(10);

  // ── Moderator violations tab state ──
  const [isIssueModModalOpen, setIsIssueModModalOpen] = useState(false);
  const [modViolationToDelete, setModViolationToDelete] = useState<ModeratorViolation | null>(null);

  // ── API: Predefined items ──
  const { data, isLoading, isError, error } = useViolations();
  const deleteViolationMutation = useDeleteViolationItem();

  // ── API: Teacher violations history ──
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useAllViolationsHistory(
    historyPage,
    historyLimit,
    historyTypeFilter !== "all" ? (historyTypeFilter as ViolationType) : undefined
  );

  // ── API: Moderator violations ──
  const {
    data: modViolationsData,
    isLoading: isModViolationsLoading,
    isError: isModViolationsError,
  } = useGetModeratorViolations();
  const deleteModViolationMutation = useDeleteModeratorViolation();
  const createModViolationMutation = useCreateModeratorViolations();

  // ── API: Moderators list for the issue modal ──
  const { data: moderatorsResponse } = useAllModerators({ page: 1, limit: 100 });
  const allModerators = moderatorsResponse?.data?.items || [];

  // ── Derived data ──
  const items: ViolationItem[] = Array.isArray(data?.data)
    ? (data.data as any)
    : (data?.data as any)?.items || [];

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.defaultType === filterType;
  });

  const historyViolations: IssuedViolationHistoryItem[] = historyData?.data?.violations || [];
  const historyPagination = historyData?.data?.pagination;

  const modViolations: ModeratorViolation[] = modViolationsData?.data?.violations || [];
  const modPagination = modViolationsData?.data?.pagination;

  // ── Handlers ──
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await deleteViolationMutation.mutateAsync(itemToDelete.id);
      message.success(isRtl ? "تم حذف البند بنجاح" : "Item deleted successfully");
      setItemToDelete(null);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || (isRtl ? "حدث خطأ أثناء الحذف" : "Failed to delete item")
      );
    }
  };

  const handleConfirmDeleteModViolation = async () => {
    if (!modViolationToDelete) return;
    deleteModViolationMutation.mutate(modViolationToDelete.id, {
      onSuccess: () => {
        message.success(isRtl ? "تم حذف المخالفة بنجاح" : "Violation deleted successfully");
        setModViolationToDelete(null);
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message || (isRtl ? "فشل حذف المخالفة" : "Failed to delete violation")
        );
      },
    });
  };

  // ── Columns: Predefined Items ──
  const itemColumns = [
    {
      title: isRtl ? "العنوان بالعربية" : "Title (Arabic)",
      dataIndex: "title_ar",
      key: "title_ar",
      render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: isRtl ? "العنوان بالإنجليزية" : "Title (English)",
      dataIndex: "title_en",
      key: "title_en",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: isRtl ? "النوع الافتراضي" : "Default Type",
      dataIndex: "defaultType",
      key: "defaultType",
      render: (type: string) => (
        <Tag color={type === "penalty" ? "red" : "gold"} className="px-2 py-0.5 font-medium">
          {type === "penalty"
            ? isRtl ? "مخالفة / خصم" : "Penalty"
            : isRtl ? "تحذير" : "Warning"}
        </Tag>
      ),
    },
    {
      title: isRtl ? "قيمة الخصم الافتراضية" : "Default Deduction",
      dataIndex: "defaultDeductionAmount",
      key: "defaultDeductionAmount",
      render: (amount: number) => (
        <span className="font-medium text-gray-800">
          {amount > 0 ? `${amount} ${isRtl ? "ج.م" : "EGP"}` : isRtl ? "بدون خصم" : "No deduction"}
        </span>
      ),
    },
    {
      title: isRtl ? "الوصف" : "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => <span className="text-gray-600">{text || "-"}</span>,
    },
    {
      title: isRtl ? "الحالة" : "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? (isRtl ? "مفعل" : "Active") : isRtl ? "معطل" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: isRtl ? "تاريخ الإنشاء" : "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (dateStr: string) =>
        dateStr ? new Date(dateStr).toLocaleDateString(isRtl ? "ar-EG" : "en-US") : "-",
    },
    {
      title: isRtl ? "الإجراءات" : "Actions",
      key: "actions",
      render: (_: any, record: ViolationItem) => (
        <Button
          type="text"
          danger
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
          onClick={() => setItemToDelete(record)}
          title={isRtl ? "حذف" : "Delete"}
        />
      ),
    },
  ];

  // ── Columns: Teacher Violations History ──
  const historyColumns = [
    {
      title: isRtl ? "اسم المعلم" : "Teacher Name",
      dataIndex: ["teacher", "user", "name"],
      key: "teacherName",
      render: (_: any, record: IssuedViolationHistoryItem) => (
        <span className="font-semibold text-gray-900">{record.teacher?.user?.name || "-"}</span>
      ),
    },
    {
      title: isRtl ? "بند المخالفة" : "Infraction Item",
      dataIndex: "infractionItem",
      key: "infractionItem",
      render: (_: any, record: IssuedViolationHistoryItem) => (
        <span className="text-gray-800 font-medium">
          {isRtl ? record.infractionItem?.title_ar : record.infractionItem?.title_en}
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
      title: isRtl ? "قيمة الخصم" : "Deduction Amount",
      dataIndex: "deductionAmount",
      key: "deductionAmount",
      render: (amount: number) => (
        <span className="font-medium text-red-600">
          {amount > 0 ? `${amount} ${isRtl ? "ج.م" : "EGP"}` : isRtl ? "بدون خصم" : "No deduction"}
        </span>
      ),
    },
    {
      title: isRtl ? "السبب" : "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => <span className="text-gray-600">{text || "-"}</span>,
    },
    {
      title: isRtl ? "المشرف الصادر عنه" : "Supervisor",
      dataIndex: ["supervisor", "name"],
      key: "supervisorName",
      render: (_: any, record: IssuedViolationHistoryItem) => (
        <span className="text-gray-700">{record.supervisor?.name || "-"}</span>
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

  // ── Columns: Moderator Violations ──
  const modViolationColumns = [
    {
      title: isRtl ? "المشرف" : "Moderator",
      key: "moderator",
      render: (_: any, record: ModeratorViolation) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {record.moderator?.user?.name?.charAt(0).toUpperCase() || "M"}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              {record.moderator?.user?.name || "-"}
            </div>
            <div className="text-xs text-gray-400">{record.moderator?.user?.email || "-"}</div>
          </div>
        </div>
      ),
    },
    {
      title: isRtl ? "بند المخالفة" : "Infraction Item",
      key: "infractionItem",
      render: (_: any, record: ModeratorViolation) => (
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
      render: (_: any, record: ModeratorViolation) => (
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
    {
      title: isRtl ? "الإجراءات" : "Actions",
      key: "actions",
      render: (_: any, record: ModeratorViolation) => (
        <Button
          type="text"
          danger
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
          onClick={() => setModViolationToDelete(record)}
          loading={deleteModViolationMutation.isPending}
          title={isRtl ? "حذف" : "Delete"}
        />
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? "المخالفات والتحذيرات" : "Violations & Warnings"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRtl
              ? "إدارة بنود المخالفات ومتابعة سجل التحذيرات والعقوبات الصادرة"
              : "Manage violation items and track issued warnings and penalties history"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "moderator" && (
            <Button
              type="default"
              danger
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => setIsIssueModModalOpen(true)}
              className="flex items-center gap-2"
            >
              {isRtl ? "إصدار مخالفة للمشرف" : "Issue Violation to Moderator"}
            </Button>
          )}
          {activeTab !== "moderator" && (
            <>
              <Button
                type="default"
                danger
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => setIsIssueModalOpen(true)}
                className="flex items-center gap-2"
              >
                {isRtl ? "إصدار مخالفة للمعلم" : "Issue Violation to Teacher"}
              </Button>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                {isRtl ? "إضافة بند جديد" : "Add New Item"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {isRtl ? "إجمالي بنود المخالفات" : "Total Infraction Items"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{items.length}</h3>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {isRtl ? "بنود التحذيرات" : "Warning Items"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {items.filter((i) => i.defaultType === "warning").length}
                </h3>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {isRtl ? "البنود النشطة" : "Active Items"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {items.filter((i) => i.active).length}
                </h3>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tab Card */}
      <Card className="shadow-sm border-gray-100 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Pill Segmented Switcher */}
          <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl gap-1 flex-wrap">
            {/* Tab 1: Items */}
            <button
              onClick={() => setActiveTab("items")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "items"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <List className="w-4 h-4" />
              <span>{isRtl ? "جدول البنود المحددة" : "Predefined Items"}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "items" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-700"
                }`}
              >
                {items.length}
              </span>
            </button>

            {/* Tab 2: Teacher History */}
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>{isRtl ? "مخالفات المعلمين" : "Teacher Violations"}</span>
              {(historyPagination?.totalItems !== undefined) && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "history"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {historyPagination?.totalItems ?? 0}
                </span>
              )}
            </button>

            {/* Tab 3: Moderator Violations */}
            <button
              onClick={() => setActiveTab("moderator")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "moderator"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isRtl ? "مخالفات المشرفين" : "Moderator Violations"}</span>
              {modViolations.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "moderator"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {modPagination?.totalItems ?? modViolations.length}
                </span>
              )}
            </button>
          </div>

          {/* Filters per tab */}
          {activeTab === "items" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={filterType}
                onChange={(val) => setFilterType(val)}
                className="w-full sm:w-48"
                options={[
                  { value: "all", label: isRtl ? "كل الأنواع" : "All Types" },
                  { value: "warning", label: isRtl ? "تحذير" : "Warning" },
                  { value: "penalty", label: isRtl ? "خصم / عقوبة" : "Penalty" },
                ]}
              />
            </div>
          )}
          {activeTab === "history" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={historyTypeFilter}
                onChange={(val) => {
                  setHistoryTypeFilter(val);
                  setHistoryPage(1);
                }}
                className="w-full sm:w-48"
                options={[
                  { value: "all", label: isRtl ? "كل السجلات" : "All History" },
                  { value: "warning", label: isRtl ? "التحذيرات فقط" : "Warnings Only" },
                  { value: "penalty", label: isRtl ? "العقوبات فقط" : "Penalties Only" },
                ]}
              />
            </div>
          )}
        </div>

        {/* Tab 1: Predefined Items */}
        {activeTab === "items" && (
          <div>
            {isError && (
              <Alert
                type="error"
                message={isRtl ? "حدث خطأ أثناء جلب البيانات" : "Failed to load violation items"}
                description={(error as any)?.message || ""}
                showIcon
                className="mb-4"
              />
            )}
            <Spin spinning={isLoading}>
              <Table
                columns={itemColumns}
                dataSource={filteredItems}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />
            </Spin>
          </div>
        )}

        {/* Tab 2: Teacher Violations History */}
        {activeTab === "history" && (
          <div>
            {isHistoryError && (
              <Alert
                type="error"
                message={isRtl ? "حدث خطأ أثناء جلب سجل المخالفات" : "Failed to load violations history"}
                description={(historyError as any)?.message || ""}
                showIcon
                className="mb-4"
              />
            )}
            <Spin spinning={isHistoryLoading}>
              <Table
                columns={historyColumns}
                dataSource={historyViolations}
                rowKey="id"
                pagination={{
                  current: historyPage,
                  pageSize: historyLimit,
                  total: historyPagination?.totalItems ?? 0,
                  onChange: (page) => setHistoryPage(page),
                  showSizeChanger: false,
                }}
                scroll={{ x: true }}
              />
            </Spin>
          </div>
        )}

        {/* Tab 3: Moderator Violations */}
        {activeTab === "moderator" && (
          <div>
            {isModViolationsError && (
              <Alert
                type="error"
                message={isRtl ? "حدث خطأ أثناء جلب مخالفات المشرفين" : "Failed to load moderator violations"}
                showIcon
                className="mb-4"
              />
            )}
            <Spin spinning={isModViolationsLoading}>
              <Table
                columns={modViolationColumns}
                dataSource={modViolations}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  total: modPagination?.totalItems ?? modViolations.length,
                  showSizeChanger: false,
                }}
                scroll={{ x: true }}
                locale={{
                  emptyText: (
                    <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                      <UserCheck className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-medium">
                        {isRtl ? "لا توجد مخالفات مسجلة للمشرفين" : "No moderator violations recorded"}
                      </p>
                    </div>
                  ),
                }}
              />
            </Spin>
          </div>
        )}
      </Card>

      {/* ─── Modals ─── */}
      <AddViolationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <IssueViolationModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} />

      {/* Issue Moderator Violation Modal */}
      <IssueModeratorViolationModal
        isOpen={isIssueModModalOpen}
        onClose={() => setIsIssueModModalOpen(false)}
        moderators={allModerators}
        violationItems={items}
        onSubmit={(payload) => {
          createModViolationMutation.mutate(payload, {
            onSuccess: () => {
              message.success(isRtl ? "تم إصدار المخالفة بنجاح" : "Violation issued successfully");
              setIsIssueModModalOpen(false);
            },
            onError: (err: any) => {
              message.error(
                err?.response?.data?.message || (isRtl ? "فشل إصدار المخالفة" : "Failed to issue violation")
              );
            },
          });
        }}
        isPending={createModViolationMutation.isPending}
        isRtl={isRtl}
      />

      {/* Delete Item Confirmation */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDeleteItem}
        title={isRtl ? "تأكيد حذف بند المخالفة" : "Confirm Item Deletion"}
        message={
          isRtl
            ? `هل أنت تأكد من رغبتك في حذف بند "${itemToDelete?.title_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the item "${itemToDelete?.title_en}"? This action cannot be undone.`
        }
        confirmText={isRtl ? "نعم، احذف" : "Delete"}
        cancelText={isRtl ? "إلغاء" : "Cancel"}
        isLoading={deleteViolationMutation.isPending}
      />

      {/* Delete Moderator Violation Confirmation */}
      <ConfirmModal
        isOpen={!!modViolationToDelete}
        onClose={() => setModViolationToDelete(null)}
        onConfirm={handleConfirmDeleteModViolation}
        title={isRtl ? "تأكيد حذف مخالفة المشرف" : "Confirm Violation Deletion"}
        message={
          isRtl
            ? `هل أنت متأكد من حذف مخالفة "${modViolationToDelete?.infractionItem?.title_ar || ""}"؟`
            : `Are you sure you want to delete this moderator violation?`
        }
        confirmText={isRtl ? "نعم، احذف" : "Delete"}
        cancelText={isRtl ? "إلغاء" : "Cancel"}
        isLoading={deleteModViolationMutation.isPending}
      />
    </div>
  );
}

// ─── Issue Moderator Violation Modal (inline component) ──────────────────────
interface IssueModeratorViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  moderators: any[];
  violationItems: ViolationItem[];
  onSubmit: (payload: IssueModeratorViolationPayload) => void;
  isPending: boolean;
  isRtl: boolean;
}

function IssueModeratorViolationModal({
  isOpen,
  onClose,
  moderators,
  violationItems,
  onSubmit,
  isPending,
  isRtl,
}: IssueModeratorViolationModalProps) {
  const [form] = Form.useForm();

  if (!isOpen) return null;

  const handleItemSelect = (itemId: string) => {
    const item = violationItems.find((i) => i.id === itemId);
    if (item) {
      form.setFieldsValue({
        type: item.defaultType,
        deductionAmount: item.defaultDeductionAmount || 0,
        reason: item.description || "",
      });
    }
  };

  const handleSubmit = (values: any) => {
    onSubmit({
      moderatorId: values.moderatorId,
      infractionItemId: values.infractionItemId,
      type: values.type,
      deductionAmount: values.deductionAmount || 0,
      reason: values.reason,
    });
    form.resetFields();
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="sticky top-0 bg-red-600 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-white" />
            <span>{isRtl ? "إصدار مخالفة للمشرف" : "Issue Violation to Moderator"}</span>
          </h2>
          <button
            onClick={() => { onClose(); form.resetFields(); }}
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="p-6 space-y-4">
          <Form.Item
            name="moderatorId"
            label={<span className="font-medium text-gray-700">{isRtl ? "اختر المشرف *" : "Select Moderator *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى اختيار المشرف" : "Please select moderator" }]}
          >
            <Select
              showSearch
              placeholder={isRtl ? "ابحث عن المشرف..." : "Search moderator..."}
              filterOption={(input, option) =>
                (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
              }
              options={moderators.map((m: any) => ({
                value: m.id,
                label: m.user?.name || m.user?.email || m.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="infractionItemId"
            label={<span className="font-medium text-gray-700">{isRtl ? "اختر بند المخالفة *" : "Select Infraction Item *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى اختيار البند" : "Please select item" }]}
          >
            <Select
              placeholder={isRtl ? "اختر البند..." : "Select item..."}
              onChange={handleItemSelect}
              options={violationItems.map((item) => ({
                value: item.id,
                label: `${isRtl ? item.title_ar : item.title_en} (${
                  item.defaultType === "penalty"
                    ? isRtl ? "خصم" : "Penalty"
                    : isRtl ? "تحذير" : "Warning"
                })`,
              }))}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label={<span className="font-medium text-gray-700">{isRtl ? "نوع الإجراء *" : "Action Type *"}</span>}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "warning", label: isRtl ? "تحذير" : "Warning" },
                  { value: "penalty", label: isRtl ? "عقوبة / خصم" : "Penalty" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="deductionAmount"
              label={<span className="font-medium text-gray-700">{isRtl ? "مبلغ الخصم (ج.م) *" : "Deduction Amount *"}</span>}
              rules={[{ required: true, message: isRtl ? "يرجى كتابة المبلغ" : "Please enter amount" }]}
            >
              <InputNumber className="w-full rounded-lg" min={0} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            name="reason"
            label={<span className="font-medium text-gray-700">{isRtl ? "السبب *" : "Reason *"}</span>}
            rules={[{ required: true, message: isRtl ? "يرجى كتابة السبب" : "Please enter reason" }]}
          >
            <Input.TextArea
              rows={3}
              className="rounded-lg"
              placeholder={isRtl ? "أدخل سبب إصدار المخالفة..." : "Enter reason..."}
            />
          </Form.Item>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onClose(); form.resetFields(); }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isPending}
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
