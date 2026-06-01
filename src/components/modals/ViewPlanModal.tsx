import { X, CheckCircle, Package, CreditCard, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ViewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name_ar: string;
    name_en: string;
    description: string;
    price: number | string;
    currency?: { code: string };

    duration: number;
    sessionsCount: number;
    sessionTime: number;
    features: string[];
    bestSeller: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };


}

export default function ViewPlanModal({ isOpen, onClose, plan }: ViewPlanModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'تفاصيل الخطة', en: 'Plan Details' },
    nameAr: { ar: 'اسم الخطة (عربي)', en: 'Plan Name (Arabic)' },
    nameEn: { ar: 'اسم الخطة (إنجليزي)', en: 'Plan Name (English)' },
    description: { ar: 'الوصف', en: 'Description' },
    price: { ar: 'السعر', en: 'Price' },
    currency: { ar: 'العملة', en: 'Currency' },
    duration: { ar: 'المدة', en: 'Duration' },
    month: { ar: 'شهر', en: 'month' },
    months: { ar: 'أشهر', en: 'months' },
    sessionsCount: { ar: 'عدد الحصص', en: 'Sessions Count' },
    session: { ar: 'حصة', en: 'session' },
    sessions: { ar: 'حصص', en: 'sessions' },
    features: { ar: 'المميزات', en: 'Features' },
    status: { ar: 'الحالة', en: 'Status' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    isPopular: { ar: 'الأكثر شعبية', en: 'Most Popular' },
    sessionTime: { ar: 'مدة الحصة (دقيقة)', en: 'Session Time (Minutes)' },
    yes: { ar: 'نعم', en: 'Yes' },

    no: { ar: 'لا', en: 'No' },
    close: { ar: 'إغلاق', en: 'Close' },
    planInfo: { ar: 'معلومات الخطة', en: 'Plan Information' },
    pricing: { ar: 'التسعير', en: 'Pricing' }
  };

  if (!isOpen) return null;

  const getStatusStyle = (status: string) => {
    return status === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {plan.bestSeller && (
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white text-center py-3 px-6 rounded-xl font-bold text-lg shadow-lg">
              {text.isPopular[language]}
            </div>
          )}


          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.planInfo[language]}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.nameAr[language]}</p>
                <p className="text-base font-semibold text-gray-900">{plan.name_ar}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.nameEn[language]}</p>
                <p className="text-base font-semibold text-gray-900">{plan.name_en}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">{text.description[language]}</p>
                <p className="text-base font-semibold text-gray-900">{plan.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{text.status[language]}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${plan.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                  {plan.active ? text.active[language] : text.inactive[language]}
                </span>
              </div>

            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.pricing[language]}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-3 text-center">{text.price[language]}</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-green-600">{plan.price}</p>
                    <span className="text-lg font-semibold text-gray-700">{plan.currency?.code}</span>
                  </div>
                </div>

              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-3 text-center">{text.duration[language]}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <p className="text-4xl font-bold text-blue-600">{plan.duration}</p>
                  <span className="text-lg font-semibold text-gray-700">
                    {plan.duration === 1 ? text.month[language] : text.months[language]}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-orange-200 text-center">
                <p className="text-sm text-gray-600 mb-3">{text.sessionsCount[language]}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <p className="text-4xl font-bold text-orange-600">{plan.sessionsCount}</p>
                  <span className="text-lg font-semibold text-gray-700">
                    {plan.sessionsCount === 1 ? text.session[language] : text.sessions[language]}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
                <p className="text-sm text-gray-600 mb-3">{text.sessionTime[language]}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <p className="text-4xl font-bold text-indigo-600">{plan.sessionTime}</p>
                  <span className="text-lg font-semibold text-gray-700">
                    {language === 'ar' ? 'دقيقة' : 'min'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.features[language]}</h3>
            </div>
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-200">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 flex-1 text-start">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {text.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
