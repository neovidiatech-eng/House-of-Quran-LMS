import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';

interface ViolationHeaderProps {
  onRefresh: () => void;
  isFetching: boolean;
}

export default function ViolationHeader({ onRefresh, isFetching }: ViolationHeaderProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#4f46e5';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        >
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? 'المخالفات والتحذيرات' : 'Violations & Warnings'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRtl
              ? 'متابعة سجل التحذيرات والخصومات الماليّة ولائحة السلوك الخاصة بالمعلم'
              : 'Track your warnings, penalties, financial deductions, and conduct guidelines'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
}
