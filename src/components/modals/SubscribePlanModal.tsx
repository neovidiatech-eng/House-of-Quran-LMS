import { X, CheckCircle, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: string;
  currency: string;
  duration: string;
  sessionsCount: number;
  features: string[];
  isPopular: boolean;
  status: 'active' | 'inactive';
}

interface SubscribePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribePlanModal({ isOpen, onClose }: SubscribePlanModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'خطط الاشتراك', en: 'Subscription Plans' },
    subscribe: { ar: 'اشترك الآن', en: 'Subscribe Now' },
    popular: { ar: 'الأكثر شعبية', en: 'Most Popular' },
    sessions: { ar: 'حصة', en: 'sessions' },
    month: { ar: 'شهر', en: 'month' },
    noPlans: { ar: 'لا توجد خطط', en: 'No plans found' },
    features: { ar: 'المميزات', en: 'Features' }
  };

  const [plans] = useState<Plan[]>([
    {
      id: '1',
      name: 'الباقة الأساسية',
      nameEn: 'Basic Plan',
      description: 'خطة مثالية للمبتدئين',
      price: '500',
      currency: 'EGP',
      duration: '1',
      sessionsCount: 12,
      features: [
        '12 حصة شهرياً',
        'دعم فني على مدار الساعة',
        'وصول للمواد التعليمية',
        'تقارير الأداء الأسبوعية'
      ],
      isPopular: false,
      status: 'active'
    },
    {
      id: '2',
      name: 'الباقة المتقدمة',
      nameEn: 'Advanced Plan',
      description: 'خطة شاملة مع مزايا إضافية',
      price: '800',
      currency: 'EGP',
      duration: '1',
      sessionsCount: 20,
      features: [
        '20 حصة شهرياً',
        'دعم فني على مدار الساعة',
        'وصول للمواد التعليمية',
        'تقارير الأداء اليومية',
        'حصص إضافية مجانية',
        'متابعة شخصية'
      ],
      isPopular: true,
      status: 'active'
    },
    {
      id: '3',
      name: 'الباقة البريميوم',
      nameEn: 'Premium Plan',
      description: 'أفضل خطة لأقصى استفادة',
      price: '1200',
      currency: 'EGP',
      duration: '1',
      sessionsCount: 30,
      features: [
        '30 حصة شهرياً',
        'دعم فني على مدار الساعة',
        'وصول للمواد التعليمية',
        'تقارير الأداء اليومية',
        'حصص إضافية مجانية',
        'متابعة شخصية',
        'ورش عمل حصرية',
        'أولوية في الحجز'
      ],
      isPopular: false,
      status: 'active'
    }
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 z-[9999] bg-white  overflow-y-auto no-scrollbar">
      <div className="min-h-screen p-6 sm:p-12 relative flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{text.title[language]}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'ar' ? 'اختر الخطة المناسبة لك وابدأ رحلتك التعليمية معنا' : 'Choose the right plan for you and start your educational journey with us'}
          </p>
        </div>

        <div className="max-w-7xl mx-auto w-full flex-1 mb-8">
          {plans.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{text.noPlans[language]}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center h-full">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl relative flex flex-col h-full bg-clip-padding border-2 ${plan.isPopular
                      ? 'border-blue-500 scale-105 z-10'
                      : 'border-gray-100'
                    }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-max px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-bold text-sm shadow-sm z-20">
                      {text.popular[language]}
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {language === 'ar' ? plan.name : plan.nameEn}
                      </h3>
                      <p className="text-gray-500 text-sm">{plan.description}</p>
                    </div>

                    <div className="text-center mb-8">
                      <div className="flex justify-center items-baseline gap-2">
                        <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                        <div className="text-start flex flex-col items-start leading-none gap-1">
                          <span className="text-gray-500 font-medium">{plan.currency}</span>
                          <span className="text-sm text-gray-400">/{text.month[language]}</span>
                        </div>
                      </div>
                      <div className="mt-3 inline-block px-4 py-1.5 bg-primary-50 text-blue-700 rounded-full text-sm font-semibold">
                        {plan.sessionsCount} {text.sessions[language]}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-start w-full">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${plan.isPopular
                          ? 'bg-primary text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                      {text.subscribe[language]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
