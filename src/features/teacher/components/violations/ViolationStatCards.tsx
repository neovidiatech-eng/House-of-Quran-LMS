import { FileText, AlertTriangle, Ban, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';

interface Metrics {
  total: number;
  warnings: number;
  penalties: number;
  totalDeductions: number;
}

interface ViolationStatCardsProps {
  metrics: Metrics;
}

export default function ViolationStatCards({ metrics }: ViolationStatCardsProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{isRtl ? 'إجمالي السجلات' : 'Total Recorded'}</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{metrics.total}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{isRtl ? 'التحذيرات' : 'Warnings'}</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{metrics.warnings}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <Ban className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{isRtl ? 'الخصومات والمخالفات' : 'Penalties'}</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{metrics.penalties}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{isRtl ? 'إجمالي الخصومات المالية' : 'Total Financial Deductions'}</p>
          <h3 className="text-xl font-bold text-red-600 mt-1">
            {metrics.totalDeductions} {settings.currency || (isRtl ? 'ج.م' : 'EGP')}
          </h3>
        </div>
      </div>
    </div>
  );
}
