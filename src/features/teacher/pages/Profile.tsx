import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../contexts/SettingsContext';
import {
  Mail, Phone, MapPin,
  Clock, Wallet, ArrowUpRight,
  BookOpen, Users, FileText,
  Video, Check, ExternalLink, Edit2, DollarSign
} from 'lucide-react';
import { Spin } from 'antd';
import { useTeacherProfile, useWithdrawals, useWithdrawRequest, useUpdateMeetingLink } from '../hooks/useTeacherProfile';
import WithdrawalModal from '../../../components/modals/WithdrawModal';

// Internal Withdrawal Modal Component


export default function TeacherProfile() {
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const isRtl = i18n.language.split('-')[0] === 'ar';
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { data: response, isLoading, error } = useTeacherProfile();
  const { data: withdrawalsResponse, isLoading: isWithdrawalsLoading } = useWithdrawals();
  const { mutateAsync } = useWithdrawRequest();
  const updateMeetingMutation = useUpdateMeetingLink();

  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [newMeetingLink, setNewMeetingLink] = useState('');
  // const [isCopied, setIsCopied] = useState(false);


  if (isLoading || isWithdrawalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        {isRtl ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading profile data'}
      </div>
    );
  }

  const profileData = response.data;
  const teacher = profileData.teacher;
  const apiStats = profileData.stats;
  const wallet = teacher.wallet?.[0];
  const balance = wallet?.balance ?? 0;
  const currencySymbol = wallet.currency.symbol;

  // Teacher Personal Info
  const teacherInfo = {
    name: teacher.name || (isRtl ? 'أ. محمد الأحمدي' : 'Mr. Mohamed El-Ahmady'),
    email: teacher.email || 'teacher@lms.com',
    phone: teacher.phone || '+20 100 123 4567',
    title: isRtl ? 'معلم' : 'Teacher',
    hourPrice: teacher.hourPrice,
  };

  // Financial Stats
  const withdrawals = withdrawalsResponse?.data?.withdrawals || [];
  const financialInfo = {
    pendingBalance: balance,
    totalWithdrawn: withdrawals
      ?.filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0) || 0,
    transactions: withdrawals.map(w => ({
      id: w.id,
      type: isRtl ? 'طلب سحب' : 'Withdrawal Request',
      amount: w.amount,
      date: new Date(w.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'),
      status: w.status
    }))
  };

  // Quick Stats
  const stats = [
    { label: isRtl ? 'المواد' : 'Subjects', value: apiStats.totalSubjects.toString(), icon: BookOpen },
    { label: isRtl ? 'الطلاب' : 'Students', value: apiStats.totalStudents.toString(), icon: Users },
    { label: isRtl ? 'الحصص' : 'Sessions', value: apiStats.totalSessions.toString(), icon: Clock },
  ];

  const handleWithdraw = (amount: number) => {
    mutateAsync({ amount })
    setIsWithdrawModalOpen(false);
  };

  const handleStartEdit = () => {
    setNewMeetingLink(teacher.meeting_link || '');
    setIsEditingMeeting(true);
  };

  const handleSaveMeeting = async () => {
    try {
      await updateMeetingMutation.mutateAsync({ meeting_link: newMeetingLink });
      setIsEditingMeeting(false);
    } catch (e) {
      // Handled by hook onError
    }
  };

  // const handleCopyLink = () => {
  //   if (teacher.meeting_link) {
  //     navigator.clipboard.writeText(teacher.meeting_link);
  //     setIsCopied(true);
  //     setTimeout(() => setIsCopied(false), 2000);
  //   }
  // };


  return (
    <div className="space-y-6 animate-fade-in pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{isRtl ? 'الملف الشخصي' : 'Profile'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Teacher Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="h-24 bg-gradient-to-r"
              style={{ backgroundImage: `linear-gradient(to right, ${settings.primaryColor}, ${settings.accentColor})` }}
            />
            <div className="px-6 pb-6 relative">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="w-24 h-24 bg-white rounded-full p-2 shadow-md">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {teacherInfo.name.includes('أ. ') ? teacherInfo.name.split('أ. ')[1].charAt(0) : teacherInfo.name.charAt(0)}
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{teacherInfo.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{teacherInfo.title}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-gray-700">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">{teacherInfo.hourPrice} {currencySymbol}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm truncate">{teacherInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm" dir="ltr">
                    {(() => {
                      const parts = teacherInfo.phone.split(' ').filter(Boolean);
                      if (parts.length > 1) {
                        const code = parts[0];
                        let number = parts.slice(1).join(' ');
                        if (number.startsWith(code)) {
                          number = number.slice(code.length);
                        }
                        return (
                          <>
                            <span className="text-gray-400 font-medium">{code}</span>
                            <span className="ml-1 text-gray-900 font-semibold">{number}</span>
                          </>
                        );
                      }
                      return teacherInfo.phone;
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{isRtl ? "مصر" : "Egypt"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Link Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5" style={{ color: settings.primaryColor }} />
                {isRtl ? 'غرفة الاجتماعات' : 'Meeting Room'}
              </h3>
              {!isEditingMeeting && (
                <button
                  onClick={handleStartEdit}
                  className="text-xs font-bold flex items-center gap-1 hover:opacity-85 transition-opacity"
                  style={{ color: settings.primaryColor }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isRtl ? 'تعديل' : 'Edit'}
                </button>
              )}
            </div>

            {isEditingMeeting ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  {isRtl
                    ? 'أدخل رابط الاجتماع الخاص بك (مثل Zoom أو Google Meet)'
                    : 'Enter your meeting link (e.g. Zoom or Google Meet)'}
                </p>
                <input
                  type="text"
                  value={newMeetingLink}
                  onChange={(e) => setNewMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                  dir="ltr"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditingMeeting(false)}
                    disabled={updateMeetingMutation.isPending}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveMeeting}
                    disabled={updateMeetingMutation.isPending}
                    className="px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all hover:opacity-90 flex items-center gap-1 shadow-sm"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {updateMeetingMutation.isPending ? (
                      <Spin size="small" className="text-white" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {isRtl ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {teacher.meeting_link ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1 text-start">{isRtl ? 'الرابط الحالي' : 'Current Link'}</p>
                      <a
                        href={teacher.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold truncate block text-blue-600 hover:underline text-start items-center gap-1"
                        dir="ltr"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{teacher.meeting_link}</span>
                      </a>
                    </div>
                   
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {isRtl ? 'لم تقم بإضافة رابط اجتماع بعد.' : 'You haven\'t added a meeting link yet.'}
                    </p>
                    <button
                      onClick={handleStartEdit}
                      className="mt-3 text-xs font-bold hover:underline"
                      style={{ color: settings.primaryColor }}
                    >
                      {isRtl ? '+ إضافة رابط اجتماع' : '+ Add Meeting Link'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">

          {/* Financial Balance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-6 h-6" style={{ color: settings.primaryColor }} />
                {isRtl ? 'الرصيد والحساب' : 'Financial Balance'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="px-4 py-2 text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {isRtl ? 'طلب سحب رصيد' : 'Withdrawal Request'}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 mb-8 text-center relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-sm text-gray-500 mb-2">{isRtl ? 'الرصيد المستحق (هذا الشهر)' : 'Pending Balance (This Month)'}</p>
                <h2 className="text-5xl font-black mb-0" style={{ color: settings.primaryColor }}>
                  {currencySymbol}{balance.toLocaleString()}
                </h2>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 opacity-30" style={{ backgroundColor: settings.primaryColor + '20' }}></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4">{isRtl ? 'أحدث المعاملات' : 'Recent Transactions'}</h3>
              {financialInfo.transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 1000 ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-blue-600'}`}>
                      {tx.amount > 1000 ? <ArrowUpRight className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{tx.type}</p>
                      <p className="text-xs text-gray-500" dir="ltr">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.status === 'pending' ? 'text-orange-500' : tx.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.status}
                  </span>
                  <span className={`font-bold ${tx.amount > 1000 ? 'text-green-600' : 'text-gray-900'}`}>
                    +{currencySymbol}{tx.amount.toLocaleString()}
                  </span>

                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: settings.primaryColor + '10', color: settings.primaryColor }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        balance={balance}
        onWithdraw={handleWithdraw}
        isRtl={isRtl}
        settings={settings}
      />
    </div>
  );
}
