import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WhatsAppPhone from '../ui/WhatsAppPhone';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

const permissionGroups = {
  dashboard: { title: 'لوحة التحكم', titleEn: 'Dashboard' },
  students: { title: 'الطلاب', titleEn: 'Students' },
  teachers: { title: 'المدرسين', titleEn: 'Teachers' },
  sessions: { title: 'الجلسات', titleEn: 'Sessions' },
  plans: { title: 'الباقات', titleEn: 'Plans' },
  subscriptions: { title: 'الاشتراكات', titleEn: 'Subscriptions' },
  exams: { title: 'الامتحانات', titleEn: 'Exams' },
  homework: { title: 'الواجبات', titleEn: 'Homework' },
  settings: { title: 'المواد', titleEn: 'Settings' },
  preparations: { title: 'الإعدادات', titleEn: 'Preparations' },
  users: { title: 'المستخدمين', titleEn: 'Users' },
  finance: { title: 'المالية', titleEn: 'Finance' },
  chats: { title: 'المحادثات', titleEn: 'Chats' },
  withdrawals: { title: 'طلبات السحب', titleEn: 'Withdrawal Requests' },
  creative: { title: 'طلبات الإبداع', titleEn: 'Creative Requests' },
};

const roleLabels: any = {
  student: { ar: 'الطالب', en: 'Student' },
  guardian: { ar: 'ولي أمر', en: 'Guardian' },
  teacher: { ar: 'المدرس', en: 'Teacher' },
  admin: { ar: 'مسؤول', en: 'Admin' },
  super_admin: { ar: 'مسؤول أعلى', en: 'Super Admin' },
};

export default function ViewUserModal({ isOpen, onClose, userData }: ViewUserModalProps) {
  const { language } = useLanguage();

  if (!isOpen || !userData) return null;

  const getRoleLabel = (role: string) => {
    return language === 'ar' ? roleLabels[role]?.ar || role : roleLabels[role]?.en || role;
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'معلومات المستخدم' : 'User Information'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1  overflow-y-auto no-scrollbar p-6">
          <div className="space-y-6">
            {/* User Avatar and Basic Info */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {userData.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{userData.name}</h3>
                <p className="text-gray-600 mt-1">{getRoleLabel(userData.role)}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-500 mb-1 text-start">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <p className="text-gray-900 font-medium text-start">{userData.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-500 mb-1 text-start">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div className="flex items-center justify-start gap-2">
                  <WhatsAppPhone phone={`${userData.countryCode || '+20'} ${userData.phone}`} />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-500 mb-1 text-start">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </label>
                <p className="text-gray-900 font-medium text-start">{getRoleLabel(userData.role)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-500 mb-1 text-start">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </label>
                <div className="flex items-center justify-start gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${userData.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {userData.status === 'active'
                      ? language === 'ar'
                        ? 'نشط'
                        : 'Active'
                      : language === 'ar'
                        ? 'غير نشط'
                        : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {userData.permissions && userData.permissions.length > 0 && (
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4 text-start">
                  {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(permissionGroups).map(([key, group]) => {
                    const hasPermission = userData.permissions?.some((p: string) =>
                      p.includes(key)
                    );
                    if (!hasPermission) return null;

                    return (
                      <div
                        key={key}
                        className="bg-primary-50 border border-blue-200 p-3 rounded-xl"
                      >
                        <p className="text-sm font-medium text-blue-900 text-start">
                          {language === 'ar' ? group.title : group.titleEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {userData.permissions?.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    {language === 'ar' ? 'لا توجد صلاحيات' : 'No permissions'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
