import { Ban, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import { NormalizedViolation } from '../../../../types/Violations';

interface ViolationTableViewProps {
  violations: NormalizedViolation[];
  onSelectViolation: (violation: NormalizedViolation) => void;
}

export default function ViolationTableView({ violations, onSelectViolation }: ViolationTableViewProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right rtl:text-right ltr:text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600">
            <tr>
              <th className="p-4">{isRtl ? 'النوع' : 'Type'}</th>
              <th className="p-4">{isRtl ? 'العنوان / البند' : 'Title / Infraction'}</th>
              <th className="p-4">{isRtl ? 'التفاصيل والسبب' : 'Reason / Details'}</th>
              <th className="p-4">{isRtl ? 'قيمة الخصم' : 'Deduction'}</th>
              <th className="p-4">{isRtl ? 'التاريخ' : 'Date'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {violations.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectViolation(item)}
                className="hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <td className="p-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${
                      item.type === 'penalty'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.type === 'penalty' ? (
                      <>
                        <Ban className="w-3 h-3" />
                        {isRtl ? 'خصم مالي' : 'Penalty'}
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        {isRtl ? 'تحذير' : 'Warning'}
                      </>
                    )}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900 whitespace-nowrap">{item.title}</td>
                <td className="p-4 text-gray-600 max-w-xs truncate">{item.reason}</td>
                <td className="p-4 font-bold text-red-600 whitespace-nowrap">
                  {item.deductionAmount > 0 ? `-${item.deductionAmount} ${settings.currency || (isRtl ? 'ج.م' : 'EGP')}` : '-'}
                </td>
                <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
