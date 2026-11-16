import { BookOpen, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import { ViolationItem } from '../../../../types/Violations';

interface ViolationRulesCatalogProps {
  catalogItems: ViolationItem[];
  isLoading: boolean;
}

export default function ViolationRulesCatalog({ catalogItems, isLoading }: ViolationRulesCatalogProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#4f46e5';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
          <span>{isRtl ? 'لائحة الضوابط والمخالفات المعتمدة' : 'Official Violation Guidelines & Policies'}</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isRtl
            ? 'استعرض البنود والشروط والجزاءات المطبقة بالمنصة لضمان جودة العملية التعليمية'
            : 'Review the rules, warnings, and penalty structures enforced on the platform'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : catalogItems.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
          <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p>{isRtl ? 'لا توجد بنود مخالفات معلنة حالياً' : 'No predefined violation guidelines available'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalogItems.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors flex items-start gap-3"
            >
              <div className="mt-1">
                {rule.defaultType === 'penalty' ? (
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">
                    {isRtl ? rule.title_ar : rule.title_en}
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      rule.defaultType === 'penalty'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rule.defaultType === 'penalty'
                      ? (isRtl
                          ? `خصم ${rule.defaultDeductionAmount > 0 ? rule.defaultDeductionAmount + ' ' + (settings.currency || 'ج.م') : ''}`
                          : `Penalty ${rule.defaultDeductionAmount > 0 ? rule.defaultDeductionAmount : ''}`)
                      : (isRtl ? 'تحذير' : 'Warning')}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    {rule.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
