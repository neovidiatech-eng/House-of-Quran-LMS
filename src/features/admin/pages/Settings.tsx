import { useState } from 'react';
import {
  Share2,
  Phone,
  Save,
  RotateCcw,
  Check,
  ChevronRight,
  Monitor,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Linkedin,
  MessageCircle,
  Twitter,
} from 'lucide-react';

import { useSettings, SocialLink } from '../../../contexts/SettingsContext';

import {
  useLateDiscountRules,
  useAddLateDiscountRule,
} from '../hooks/useAdminDashboard';

const socialPlatforms: {
  platform: SocialLink['platform'];
  label: string;
  placeholder: string;
  icon: any;
  color: string;
}[] = [
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    placeholder: '+966501234567',
    icon: MessageCircle,
    color: '#25d366',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/...',
    icon: Facebook,
    color: '#1877f2',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/...',
    icon: Instagram,
    color: '#e1306c',
  },
  {
    platform: 'twitter',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/...',
    icon: Twitter,
    color: '#000000',
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/...',
    icon: Youtube,
    color: '#ff0000',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@...',
    icon: Monitor,
    color: '#010101',
  },
  {
    platform: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/...',
    icon: Send,
    color: '#0088cc',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/...',
    icon: Linkedin,
    color: '#0077b5',
  },
];

type Tab = 'social' | 'contact' | 'Late Discount';

const tabs: { id: Tab; label: string; icon: any }[] = [
  
  { id: 'Late Discount', label: 'خصم التأخير', icon: Monitor },
];

export default function SettingsPage() {
  const { settings, updateSettings, updateSocialLink, resetSettings } =
    useSettings();

  const [activeTab, setActiveTab] = useState<Tab>('Late Discount');
  const [saved, setSaved] = useState(false);

  const [lateMinutes, setLateMinutes] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');

  const {
    data: lateDiscountRules,
    isLoading: isLateDiscountLoading,
    isError: isLateDiscountError,
  } = useLateDiscountRules();

  const addLateDiscountMutation = useAddLateDiscountRule({
    lateMinutes: Number(lateMinutes),
    discountPercentage: Number(discountPercentage),
  });

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddLateDiscount = () => {
    if (!lateMinutes || !discountPercentage) return;

    addLateDiscountMutation.mutate(undefined, {
      onSuccess: () => {
        setLateMinutes('');
        setDiscountPercentage('');
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>

          <p className="text-gray-500 text-sm mt-1">
            تخصيص المنصة وضبط إعداداتها
          </p>
        </div>

        <div className="flex gap-2">
          {/* <button
            onClick={resetSettings}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button> */}

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm text-white ${
              saved ? 'bg-green-600' : ''
            }`}
            style={
              !saved ? { backgroundColor: settings.primaryColor } : {}
            }
          >
            {saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {saved ? 'تم الحفظ' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right ${
                  activeTab === tab.id
                    ? ''
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={
                  activeTab === tab.id
                    ? {
                        backgroundColor:
                          settings.primaryColor + '15',
                        color: settings.primaryColor,
                      }
                    : {}
                }
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />

                <span className="flex-1">{tab.label}</span>

                {activeTab === tab.id && (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Social Tab */}
          {activeTab === 'social' && (
            <SectionCard
              title="روابط السوشيال ميديا"
              icon={Share2}
              primaryColor={settings.primaryColor}
            >
              <div className="space-y-3">
                {socialPlatforms.map(
                  ({
                    platform,
                    label,
                    placeholder,
                    icon: Icon,
                    color,
                  }) => {
                    const link = settings.socialLinks.find(
                      (l) => l.platform === platform
                    );

                    return (
                      <div
                        key={platform}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          link?.enabled
                            ? 'border-gray-200 bg-white shadow-sm'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div
                          onClick={() =>
                            updateSocialLink(platform, {
                              enabled: !link?.enabled,
                            })
                          }
                          className={`w-10 h-6 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${
                            link?.enabled
                              ? ''
                              : 'bg-gray-300'
                          }`}
                          style={
                            link?.enabled
                              ? {
                                  backgroundColor:
                                    settings.primaryColor,
                                }
                              : {}
                          }
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              link?.enabled
                                ? 'left-5'
                                : 'left-1'
                            }`}
                          />
                        </div>

                        <input
                          type="text"
                          value={link?.value || ''}
                          onChange={(e) =>
                            updateSocialLink(platform, {
                              value: e.target.value,
                              enabled: true,
                            })
                          }
                          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder={placeholder}
                          dir="ltr"
                          disabled={!link?.enabled}
                        />

                        <div className="flex items-center gap-2 flex-shrink-0 w-28 justify-end">
                          <span className="text-sm font-medium text-gray-700">
                            {label}
                          </span>

                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: color + '20',
                            }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </SectionCard>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <SectionCard
              title="معلومات التواصل"
              icon={Phone}
              primaryColor={settings.primaryColor}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="رقم الواتساب">
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      updateSettings({
                        whatsappNumber: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </FieldGroup>

                <FieldGroup label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      updateSettings({
                        email: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </FieldGroup>
              </div>
            </SectionCard>
          )}

          {/* Late Discount Tab */}
          {activeTab === 'Late Discount' && (
            <SectionCard
              title="إعدادات خصم التأخير"
              icon={Monitor}
              primaryColor={settings.primaryColor}
            >
              <p className="text-gray-600 text-sm mb-4 text-right">
                يتم تطبيق خصم التأخير تلقائياً بناءً على عدد
                الدقائق المتأخرة.
              </p>

              {/* Add Rule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    عدد دقائق التأخير
                  </label>

                  <input
                    type="number"
                    value={lateMinutes}
                    onChange={(e) =>
                      setLateMinutes(e.target.value)
                    }
                    placeholder="مثال: 15"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    نسبة الخصم %
                  </label>

                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) =>
                      setDiscountPercentage(e.target.value)
                    }
                    placeholder="مثال: 10"
                    className={inputCls}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddLateDiscount}
                    disabled={
                      addLateDiscountMutation.isPending
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                    style={{
                      backgroundColor:
                        settings.primaryColor,
                    }}
                  >
                    {addLateDiscountMutation.isPending
                      ? 'جاري الإضافة...'
                      : 'إضافة قاعدة'}
                  </button>
                </div>
              </div>

              {/* Rules */}
              {isLateDiscountLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  جاري تحميل قواعد خصم التأخير...
                </div>
              ) : isLateDiscountError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                  حدث خطأ أثناء تحميل البيانات
                </div>
              ) : !lateDiscountRules?.length ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  لا توجد قواعد حالياً
                </div>
              ) : (
                <div className="space-y-4">
                  {lateDiscountRules.map((rule, index) => (
                    <div
                      key={`${rule.lateMinutes}-${rule.discountPercentage}-${index}`}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50"
                    >
                      <div className="space-y-1 text-right">
                        <p className="text-sm text-gray-500">
                          عدد دقائق التأخير
                        </p>

                        <p className="text-lg font-semibold text-gray-900">
                          {rule.lateMinutes} دقيقة
                        </p>
                      </div>

                      <div className="space-y-1 text-right">
                        <p className="text-sm text-gray-500">
                          نسبة الخصم
                        </p>

                        <p className="text-lg font-semibold text-gray-900">
                          {rule.discountPercentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right';

function SectionCard({
  title,
  icon: Icon,
  children,
  primaryColor,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  primaryColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor:
              (primaryColor || '#2563eb') + '15',
          }}
        >
          <Icon
            className="w-4 h-4"
            style={{
              color: primaryColor || '#2563eb',
            }}
          />
        </div>

        <h2 className="font-semibold text-gray-800">
          {title}
        </h2>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 text-right">
        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}

      {hint && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {hint}
        </p>
      )}
    </div>
  );
}