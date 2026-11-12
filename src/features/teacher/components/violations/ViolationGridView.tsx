import { Ban, AlertTriangle, Calendar } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import { NormalizedViolation } from '../../../../types/Violations';

interface ViolationGridViewProps {
  violations: NormalizedViolation[];
  onSelectViolation: (violation: NormalizedViolation) => void;
}

export default function ViolationGridView({ violations, onSelectViolation }: ViolationGridViewProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {violations.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectViolation(item)}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
                  item.type === 'penalty'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {item.type === 'penalty' ? (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    {isRtl ? 'خصم مالي' : 'Penalty'}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {isRtl ? 'تحذير' : 'Warning'}
                  </>
                )}
              </span>

              {item.deductionAmount > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                  -{item.deductionAmount} {settings.currency || (isRtl ? 'ج.م' : 'EGP')}
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {item.reason}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{new Date(item.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
            </div>

            <span className="text-primary font-semibold text-xs group-hover:underline">
              {isRtl ? 'التفاصيل' : 'Details'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
