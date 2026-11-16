import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  // Save,
  Check,
  ChevronRight,
  Monitor,
  // Facebook,
  // Instagram,
  // Youtube,
  // Send,
  // Linkedin,
  // MessageCircle,
  // Twitter,
} from 'lucide-react';

import { useSettings, /*SocialLink*/ } from '../../../contexts/SettingsContext';
import { useLanguage } from '../../../contexts/LanguageContext';

import {
  useStudentAttendance,
  useAddStudentAttendance,
} from '../hooks/useAdminDashboard';

// const socialPlatforms: {
//   platform: SocialLink['platform'];
//   label: string;
//   placeholder: string;
//   icon: any;
//   color: string;
// }[] = [
//     {
//       platform: 'whatsapp',
//       label: 'WhatsApp',
//       placeholder: '+966501234567',
//       icon: MessageCircle,
//       color: '#25d366',
//     },
//     {
//       platform: 'facebook',
//       label: 'Facebook',
//       placeholder: 'https://facebook.com/...',
//       icon: Facebook,
//       color: '#1877f2',
//     },
//     {
//       platform: 'instagram',
//       label: 'Instagram',
//       placeholder: 'https://instagram.com/...',
//       icon: Instagram,
//       color: '#e1306c',
//     },
//     {
//       platform: 'twitter',
//       label: 'X (Twitter)',
//       placeholder: 'https://x.com/...',
//       icon: Twitter,
//       color: '#000000',
//     },
//     {
//       platform: 'youtube',
//       label: 'YouTube',
//       placeholder: 'https://youtube.com/...',
//       icon: Youtube,
//       color: '#ff0000',
//     },
//     {
//       platform: 'tiktok',
//       label: 'TikTok',
//       placeholder: 'https://tiktok.com/@...',
//       icon: Monitor,
//       color: '#010101',
//     },
//     {
//       platform: 'telegram',
//       label: 'Telegram',
//       placeholder: 'https://t.me/...',
//       icon: Send,
//       color: '#0088cc',
//     },
//     {
//       platform: 'linkedin',
//       label: 'LinkedIn',
//       placeholder: 'https://linkedin.com/...',
//       icon: Linkedin,
//       color: '#0077b5',
//     },
//   ];

type Tab = 'Student Attendance';

function useTabs() {
  const { t } = useTranslation();
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'Student Attendance', label: t('settings_tab_studentAttendance'), icon: Monitor },
  ];
  return tabs;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings,} =
    useSettings();

  const tabs = useTabs();

  const [activeTab, setActiveTab] = useState<Tab>('Student Attendance');
  const [isSaved, setIsSaved] = useState(false);

  const [paidSessionCount, setPaidSessionCount] = useState('');
  const [studentCanJoin, setStudentCanJoin] = useState(false);

  const {
    data: studentAttendance,
    isLoading: isStudentAttendanceLoading,
    isError: isStudentAttendanceError,
  } = useStudentAttendance();

  const addStudentAttendanceMutation = useAddStudentAttendance();

  // const handleSave = () => {
  //   setSaved(true);

  //   setTimeout(() => setSaved(false), 2500);
  // };

  const handleAddStudentAttendance = async () => {
    if (!paidSessionCount) return;

    try {
      await addStudentAttendanceMutation.mutateAsync({
        paidSessionCount: Number(paidSessionCount),
        studentCanJoin: studentCanJoin,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('[StudentAttendance] Save failed:', err);
    }
  };



  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-start">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings_title')}</h1>

          <p className="text-gray-500 text-sm mt-1">
            {t('settings_subtitle')}
          </p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isRtl ? 'text-right' : 'text-left'} ${activeTab === tab.id
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
          {/* Student Attendance Tab */}
          {activeTab === 'Student Attendance' && (
            <SectionCard
              title={t('settings_studentAttendance_title')}
              icon={Monitor}
              primaryColor={settings.primaryColor}
            >
              <p className={`text-gray-600 text-sm mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('settings_studentAttendance_desc')}
              </p>

              {/* Add */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t('settings_sessionCount')}
                  </label>
                  <input
                    type="text"
                    value={paidSessionCount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPaidSessionCount(value);
                    }}
                    placeholder={t('settings_sessionCountPlaceholder')}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('settings_canAttend')}
                  </label>

                  <select
                    value={String(studentCanJoin)}
                    onChange={(e) =>
                      setStudentCanJoin(e.target.value === "true")
                    }

                    className={inputCls}
                  >
                    <option value="true">{t('settings_yes')}</option>
                    <option value="false">{t('settings_no')}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddStudentAttendance}
                    disabled={addStudentAttendanceMutation.isPending || isSaved}
                    className="w-full px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-500 disabled:opacity-80"
                    style={{
                      backgroundColor: isSaved
                        ? '#16a34a'
                        : settings.primaryColor,
                      transform: isSaved ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSaved
                        ? '0 0 0 3px rgba(22,163,74,0.25)'
                        : 'none',
                    }}
                  >
                    <span
                      className={`flex items-center justify-center gap-2 ${
                        isRtl ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {isSaved && (
                        <Check
                          className="w-4 h-4 transition-all duration-300"
                          style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
                        />
                      )}
                      <span>
                        {addStudentAttendanceMutation.isPending
                          ? t('settings_adding')
                          : isSaved
                          ? t('settings_saved')
                          : t('settings_addRule')}
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Rules */}
              {isStudentAttendanceLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  {t('settings_loadingRules')}
                </div>
              ) : isStudentAttendanceError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                  {t('settings_loadError')}
                </div>
              ) : null}
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

