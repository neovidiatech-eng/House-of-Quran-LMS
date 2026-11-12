import { useState } from "react";
import { Spin, Checkbox, Tag } from "antd";
import { X, ShieldAlert, AlertTriangle, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useViolations } from "../../features/admin/hooks/useViolations";
import { ViolationItem } from "../../types/Violations";

interface ViolationGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmJoin: () => void;
  isJoining?: boolean;
}

export default function ViolationGuidelinesModal({
  isOpen,
  onClose,
  onConfirmJoin,
  isJoining = false,
}: ViolationGuidelinesModalProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.split("-")[0] === "ar";
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const { data, isLoading } = useViolations();

  if (!isOpen) return null;

  const items: ViolationItem[] = Array.isArray(data?.data)
    ? data.data
    : (data?.data as any)?.items || [];

  const activeItems = items.filter((item) => item.active);

  const handleConfirm = () => {
    onConfirmJoin();
    onClose();
    setIsAcknowledged(false);
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
            <ShieldAlert className="w-6 h-6 text-white" />
            <span>
              {isRtl
                ? "قواعد وتوجيهات الحضور والمخالفات"
                : "Session Conduct & Violation Guidelines"}
            </span>
          </h2>
          <button
            onClick={() => {
              setIsAcknowledged(false);
              onClose();
            }}
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Violation Items List */}
          <Spin spinning={isLoading}>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
              {activeItems.length > 0 ? (
                activeItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {item.defaultType === "penalty" ? (
                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {isRtl ? item.title_ar : item.title_en}
                        </h4>
                        <Tag
                          color={item.defaultType === "penalty" ? "red" : "gold"}
                          className="px-2 py-0.5 font-medium rounded-full text-xs"
                        >
                          {item.defaultType === "penalty"
                            ? isRtl
                              ? `خصم ${item.defaultDeductionAmount > 0 ? item.defaultDeductionAmount + " ج.م" : ""}`
                              : "Penalty"
                            : isRtl
                            ? "تحذير"
                            : "Warning"}
                        </Tag>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {isRtl ? "لا توجد بنود مخالفات محددة حالياً" : "No violation guidelines set"}
                </div>
              )}
            </div>
          </Spin>

          {/* Acknowledgment Checkbox */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-3">
            <Checkbox
              checked={isAcknowledged}
              onChange={(e) => setIsAcknowledged(e.target.checked)}
              className="text-sm text-gray-800 font-medium"
            >
              {isRtl
                ? "أقر بأنني قرأت جميع البنود والتنبيهات الموضحة أعلاه وألتزم بها كلياً"
                : "I acknowledge that I have read and agree to comply with all above guidelines"}
            </Checkbox>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsAcknowledged(false);
                onClose();
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              disabled={!isAcknowledged || isJoining}
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Video className="w-5 h-5" />
              <span>{isRtl ? "إقرار والدخول للحصة" : "Confirm & Join Session"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
