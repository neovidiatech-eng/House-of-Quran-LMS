import { useState } from "react";
import {
  Tag,
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Button,
  message,
} from "antd";
import {
  Trophy,
  Award,
  Users,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  useRanks,
  useCreateRank,
  useUpdateRank,
  useDeleteRank,
  useAssignRank,
} from "../hooks/useRank";
import { useStudents } from "../hooks/useStudents";
import { RankItem, CreateRankPayload, UpdateRankPayload } from "../../../types/rank";
import AddRankModal from "../../../components/modals/AddRankModal";
import AssignRankModal from "../../../components/modals/AssignRankModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { RankFormData, AssignRankFormData } from "../../../lib/schemas/RankSchema";

export default function Ranks() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<RankItem | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRankForAssign, setSelectedRankForAssign] = useState<string | null>(null);

  const [rankToDelete, setRankToDelete] = useState<RankItem | null>(null);

  // React Query Hooks
  const { data: ranksResponse, isLoading, isError, error } = useRanks();
  const createRankMutation = useCreateRank();
  const updateRankMutation = useUpdateRank();
  const deleteRankMutation = useDeleteRank();
  const assignRankMutation = useAssignRank();

  // Fetch students for assignment modal
  const { data: studentsResponse, isLoading: isStudentsLoading } = useStudents({ limit: 1000 });
  const students = studentsResponse?.data?.studentsData || (studentsResponse?.data as any)?.students || [];

  const ranks: RankItem[] = ranksResponse?.data?.ranks || [];

  // Metrics
  const totalRanks = ranks.length;
  const activeRanks = ranks.filter((r) => r.active).length;
  const totalRankedStudents = ranks.reduce(
    (sum, r) => sum + (r._count?.students || 0),
    0
  );

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingRank(null);
    setIsAddEditModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (rank: RankItem) => {
    setEditingRank(rank);
    setIsAddEditModalOpen(true);
  };

  // Submit Add or Edit
  const handleAddEditSubmit = async (values: RankFormData) => {
    try {
      if (editingRank) {
        const payload: UpdateRankPayload = { ...values };
        await updateRankMutation.mutateAsync({ id: editingRank.id, payload });
        message.success(isRtl ? "تم تحديث المستوى بنجاح" : "Rank updated successfully");
      } else {
        const payload: CreateRankPayload = { ...values };
        await createRankMutation.mutateAsync(payload);
        message.success(isRtl ? "تم إنشاء المستوى بنجاح" : "Rank created successfully");
      }
      setIsAddEditModalOpen(false);
      setEditingRank(null);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || (isRtl ? "حدث خطأ أثناء العملية" : "Operation failed")
      );
    }
  };

  // Confirm & Delete Rank
  const handleConfirmDelete = async () => {
    if (!rankToDelete) return;
    try {
      await deleteRankMutation.mutateAsync(rankToDelete.id);
      message.success(isRtl ? "تم حذف المستوى بنجاح" : "Rank deleted successfully");
      setRankToDelete(null);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || (isRtl ? "حدث خطأ أثناء الحذف" : "Delete failed")
      );
    }
  };

  // Open Assign Modal
  const handleOpenAssignModal = (rankId?: string) => {
    setSelectedRankForAssign(rankId || null);
    setIsAssignModalOpen(true);
  };

  // Submit Assign
  const handleAssignSubmit = async (values: AssignRankFormData) => {
    try {
      await assignRankMutation.mutateAsync(values);
      message.success(isRtl ? "تم تعيين المستوى للطالب بنجاح" : "Rank assigned successfully");
      setIsAssignModalOpen(false);
      setSelectedRankForAssign(null);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || (isRtl ? "حدث خطأ أثناء التعيين" : "Assignment failed")
      );
    }
  };

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? "نظام المستويات ورتب الطلاب" : "Student Ranks & Levels System"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRtl
              ? "إدارة رتب ومستويات تقدم الطلاب وتحديد متطلبات الحصص والنقاط"
              : "Manage student progress ranks, session limits, and point thresholds"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="default"
            icon={<UserCheck className="w-4 h-4" />}
            onClick={() => handleOpenAssignModal()}
            className="flex items-center gap-2"
          >
            {isRtl ? "تعيين رتبة لطالب" : "Assign Rank to Student"}
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            {isRtl ? "إضافة مستوى جديد" : "Add New Rank"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {isRtl ? "إجمالي المستويات" : "Total Ranks"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{totalRanks}</h3>
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
                  {isRtl ? "المستويات النشطة" : "Active Ranks"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{activeRanks}</h3>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {isRtl ? "الطلاب المصنفين" : "Ranked Students"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{totalRankedStudents}</h3>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Ranks Cards Grid */}
      {isError && (
        <Alert
          type="error"
          message={isRtl ? "حدث خطأ أثناء جلب المستويات" : "Failed to load ranks"}
          description={(error as any)?.message || ""}
          showIcon
          className="mb-4"
        />
      )}

      <Spin spinning={isLoading}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ranks.map((rank) => (
            <div
              key={rank.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Top Banner Color Accent */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: rank.color || "#3b82f6" }}
              />

              <div className="p-6 space-y-4 flex-1">
                {/* Header: Badge Icon + Rank Name + Status Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-xl shrink-0"
                      style={{ backgroundColor: rank.color || "#3b82f6" }}
                    >
                      {rank.icon ? (
                        <img src={rank.icon} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        <Award className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-snug">
                        {isRtl ? rank.name_ar : rank.name_en}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {isRtl ? rank.name_en : rank.name_ar}
                      </p>
                    </div>
                  </div>

                  <Tag
                    color={rank.active ? "success" : "default"}
                    className="px-2.5 py-0.5 rounded-full font-semibold text-xs border-0"
                  >
                    {rank.active ? (isRtl ? "نشط" : "Active") : isRtl ? "معطل" : "Inactive"}
                  </Tag>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] leading-relaxed">
                  {isRtl ? rank.description_ar || "-" : rank.description_en || "-"}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100/80">
                    <span className="text-xs text-gray-500 block mb-0.5">
                      {isRtl ? "الطلاب" : "Students"}
                    </span>
                    <span className="font-bold text-gray-900 text-base">
                      {rank._count?.students ?? 0}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100/80">
                    <span className="text-xs text-gray-500 block mb-0.5">
                      {isRtl ? "الحصص" : "Sessions"}
                    </span>
                    <span className="font-bold text-gray-900 text-base">
                      {rank.minSessions ?? 0}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100/80">
                    <span className="text-xs text-gray-500 block mb-0.5">
                      {isRtl ? "النقاط" : "Points"}
                    </span>
                    <span className="font-bold text-primary text-base">
                      {rank.minPoints ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAssignModal(rank.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isRtl ? "تعيين لطالب" : "Assign"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rank)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={isRtl ? "تعديل" : "Edit"}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankToDelete(rank)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={isRtl ? "حذف" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ranks.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">
              {isRtl ? "لا توجد مستويات مضافة بعد" : "No ranks added yet"}
            </p>
          </div>
        )}
      </Spin>

      {/* Add / Edit Rank Modal Component */}
      <AddRankModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingRank(null);
        }}
        onSubmit={handleAddEditSubmit}
        initialData={editingRank}
        isLoading={createRankMutation.isPending || updateRankMutation.isPending}
      />

      {/* Assign Rank Modal Component */}
      <AssignRankModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedRankForAssign(null);
        }}
        onSubmit={handleAssignSubmit}
        ranks={ranks}
        students={students}
        initialRankId={selectedRankForAssign}
        isLoading={assignRankMutation.isPending}
        isStudentsLoading={isStudentsLoading}
      />

      {/* Delete Confirmation Modal Component */}
      <ConfirmModal
        isOpen={!!rankToDelete}
        onClose={() => setRankToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={isRtl ? "تأكيد حذف المستوى" : "Confirm Rank Deletion"}
        message={
          isRtl
            ? `هل أنت تأكد من رغبتك في حذف المستوى "${rankToDelete?.name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the rank "${rankToDelete?.name_en}"? This action cannot be undone.`
        }
        confirmText={isRtl ? "نعم، احذف" : "Delete"}
        cancelText={isRtl ? "إلغاء" : "Cancel"}
        isLoading={deleteRankMutation.isPending}
      />
    </div>
  );
}
