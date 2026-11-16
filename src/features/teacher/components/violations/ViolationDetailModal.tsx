import { Ban, AlertTriangle, X, UserCheck } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import { NormalizedViolation } from '../../../../types/Violations';

interface ViolationDetailModalProps {
  violation: NormalizedViolation | null;
  onClose: () => void;
}

export default function ViolationDetailModal({ violation, onClose }: ViolationDetailModalProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();

  if (!violation) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                violation.type === 'penalty' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {violation.type === 'penalty' ? <Ban className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{violation.title}</h3>
              <span className="text-xs text-gray-500">
                {new Date(violation.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">{isRtl ? 'نوع القرار:' : 'Decision Type:'}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                violation.type === 'penalty' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {violation.type === 'penalty' ? (isRtl ? 'خصم مالي / عقوبة' : 'Financial Deduction') : (isRtl ? 'تحذير رسمي' : 'Official Warning')}
            </span>
          </div>

          {violation.deductionAmount > 0 && (
            <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-xs text-rose-700 font-medium">{isRtl ? 'مقدار الخصم المالي:' : 'Deduction Amount:'}</span>
              <span className="text-base font-extrabold text-red-600">
                -{violation.deductionAmount} {settings.currency || (isRtl ? 'ج.م' : 'EGP')}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">{isRtl ? 'السبب والتفاصيل:' : 'Reason & Explanation:'}</label>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed font-medium">
              {violation.reason}
            </div>
          </div>

          {violation.supervisorName && (
            <div className="flex items-center gap-2 pt-2 text-xs text-gray-500">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <span>{isRtl ? 'الجهة المانحة:' : 'Issued By:'}</span>
              <span className="font-semibold text-gray-700">{violation.supervisorName}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
