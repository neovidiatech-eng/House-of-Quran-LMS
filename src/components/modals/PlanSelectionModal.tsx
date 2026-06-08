import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState } from 'react';
import { usePlans } from '../../features/admin/hooks/usePlans';


interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (planId: string) => void;
}

export default function PlanSelectionModal({ isOpen, onClose, onConfirm }: PlanSelectionModalProps) {
  const { language } = useLanguage();
  const { data: plans, isLoading, error } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const text = {
    title: { ar: 'تجديد الاشتراك', en: 'Renew Subscription' },
    selectPlan: { ar: 'اختر الخطة', en: 'Select Plan' },
    selectPlaceholder: { ar: 'اختر خطة اشتراك', en: 'Choose a subscription plan' },
    confirm: { ar: 'تأكيد التجديد', en: 'Confirm Renewal' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
    error: { ar: 'خطأ في جلب الخطط', en: 'Error fetching plans' },
    noPlans: { ar: 'لا توجد خطط متاحة', en: 'No plans available' },
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedPlanId) {
      onConfirm(selectedPlanId);
      setSelectedPlanId('');
    }
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto no-scrollbar"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading && (
            <p className="text-center text-gray-500 py-4">{text.loading[language]}</p>
          )}
          {error && (
            <p className="text-center text-red-500 py-4">{text.error[language]}</p>
          )}

          {!isLoading && !error && plans && plans.length === 0 && (
            <p className="text-center text-gray-500 py-4">{text.noPlans[language]}</p>
          )}

          {!isLoading && !error && plans && plans.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.selectPlan[language]}
              </label>
              <select
                value={selectedPlanId}
              
                onChange={e => setSelectedPlanId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition text-gray-800"
              >
                <option value="" disabled>{text.selectPlaceholder[language]}</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {language === 'ar' ? plan.name_ar : plan.name_en}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {text.cancel[language]}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlanId}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              selectedPlanId
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {text.confirm[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
