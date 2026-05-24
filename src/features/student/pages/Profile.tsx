import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../contexts/SettingsContext'; // Re-parsing
import {
  Mail, Phone, Calendar, MapPin,
  Package, Clock, CheckCircle, Award,
  User, Star
} from 'lucide-react';
import { useMemo, useState } from 'react';
import SubscribePlanModal from '../../../components/modals/SubscribePlanModal';
import { useProfile } from '../hooks/useProfile';
import { TeacherInfoCard } from '../components/TeacherInfoCard';

export interface TeacherInfoCardProps {
  teacher: any;
  isRtl: boolean;
  settings: any;
}



export default function StudentProfile() {
  const { i18n, t } = useTranslation();
  const { settings } = useSettings();
  const isRtl = i18n.language.split('-')[0] === 'ar';

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const { data: profileResponse, isLoading, error } = useProfile();
  const progressPercentage = useMemo(() => {
    if (!profileResponse?.data?.sessions) return 0;

    return (profileResponse.data.sessions_attended / profileResponse.data.sessions) * 100;
  }, [profileResponse]);


  const profileData = profileResponse?.data;
  const user = profileData?.user;
  const plan = profileData?.plan;
  const reviews = user?.reviewsReceived || [];

  const studentInfo = {
    name: user?.name,
    email: user?.email,
    phone: `${user?.code_country} ${user?.phone}`,
    birthDate: profileData?.birth_date ? profileData?.birth_date.split('T')[0] : '-',
    country: profileData?.country,
    progress: (Number(profileData?.sessions_attended)  / Number(profileData?.sessions)) * 100,
  };

  const subscriptionInfo = {
    planName: plan ? (isRtl ? plan.name_ar : plan.name_en) : (isRtl ? 'لا توجد باقة' : 'No Plan'),
    status: isRtl ? (profileData?.status === 'approved' ? 'نشط' : 'قيد الانتظار') : (profileData?.status === 'approved' ? 'Active' : 'Pending'),
    totalSessions: profileData?.sessions,
    sessionsUsed: profileData?.sessions_attended,
    sessionsRemaining: profileData?.sessions_remaining,
    features: plan?.features || [],
  };
  const teachers = useMemo(() => {
    const teacherMap = new Map();
    profileData?.schedules?.forEach(schedule => {
      const teacher = schedule.teacher;
      if (teacher && !teacherMap.has(teacher.id)) {
        teacherMap.set(teacher.id, {
          id: teacher.id,
          name: teacher.user?.name,
          hour_price: teacher.hour_price,
          status: schedule.status,
          subject: isRtl ? schedule.subject?.name_ar : schedule.subject?.name_en,
          nextSession: schedule.start_time
        });
      }
    });
    return Array.from(teacherMap.values());
  }, [profileData, isRtl]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" style={{ borderTopColor: settings.primaryColor }}></div>
      </div>
    );
  }

  if (error || !profileResponse?.data) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
        <div className="text-gray-400 mb-4">
          <User className="w-12 h-12 mx-auto opacity-20" />
        </div>
        <p className="text-gray-500">{t('errors.failedToLoadProfile') || 'Failed to load profile'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{isRtl ? 'الملف الشخصي' : 'Profile'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">

  {/* Header Gradient */}
  <div
    className="h-60 relative"
    style={{
      background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`
    }}
  >
    <div className="absolute inset-0 bg-black/10" />
  </div>

  {/* Content */}
  <div className="px-6 pb-6 relative">

    {/* Avatar */}
    <div className="flex justify-center -mt-12">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: settings.primaryColor }}
          >
            {studentInfo?.name?.charAt(0)}
          </div>
        </div>

        {/* Status dot */}
        <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
      </div>
    </div>

    {/* Name + role */}
    <div className="text-center mt-4 mb-6">
      <h2 className="text-xl font-bold text-gray-900">
        {studentInfo.name}
      </h2>

      <span className="inline-flex mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
        {isRtl ? 'طالب' : 'Student'}
      </span>
    </div>

    {/* Info Grid */}
    <div className="space-y-3">

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
        <Mail className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-700 truncate">
          {studentInfo.email}
        </span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
        <Phone className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-700" dir="ltr">
          {studentInfo.phone}
        </span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
        <Calendar className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-700">
          {studentInfo.birthDate}
        </span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
        <MapPin className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-700">
          {studentInfo.country}
        </span>
      </div>

    </div>
  </div>
</div>

        <div className="lg:col-span-2 space-y-6">

          {/* Subscription Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-6 h-6" style={{ color: settings.primaryColor }} />
                  {isRtl ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {subscriptionInfo.status}
                </span>
              </div>
              {/* <button
                onClick={() => setIsPlanModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <RefreshCw className="w-4 h-4" />
                {isRtl ? 'اشتراك بخطة' : 'Subscribe to Plan'}
              </button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{isRtl ? 'الباقة الحالية' : 'Current Plan'}</p>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" style={{ color: settings.primaryColor }} />
                  <span className="font-bold text-gray-900">{subscriptionInfo.planName}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{isRtl ? 'الحصص المتبقية' : 'Sessions Remaining'}</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: settings.primaryColor }} />
                  <span className="font-bold text-gray-900">{subscriptionInfo.sessionsRemaining} {isRtl ? 'حصة' : 'Sessions'}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{isRtl ? 'استهلاك الباقة' : 'Plan Usage'}</span>
                <span className="text-sm font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(progressPercentage)}%`,
                    backgroundColor: settings.primaryColor
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRtl
                  ? `تم استهلاك ${subscriptionInfo.sessionsUsed} حصة من أصل ${subscriptionInfo.totalSessions}`
                  : `${subscriptionInfo.sessionsUsed} sessions used out of ${subscriptionInfo.totalSessions}`}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{isRtl ? 'مميزات الباقة:' : 'Plan Features:'}</h3>
              <ul className="space-y-2">
                {subscriptionInfo.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Teachers Info Cards */}
          <div className="space-y-6">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <TeacherInfoCard key={teacher.id} teacher={teacher} isRtl={isRtl} settings={settings} />
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">{isRtl ? 'لا يوجد معلمين مسجلين حالياً' : 'No teachers assigned currently'}</p>
              </div>
            )}
          </div>
          {/* Reviews Section */}
          {/* Reviews Section */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      <Star
        className="w-6 h-6 animate-pulse"
        style={{ color: settings.primaryColor }}
      />
      <h2 className="text-lg font-bold text-gray-900">
        {isRtl ? 'التقييمات' : 'Reviews'}
      </h2>
    </div>

    <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
      {reviews.length} {isRtl ? 'تقييم' : 'reviews'}
    </span>
  </div>

  {reviews.length > 0 ? (
    <div className="space-y-4">
      {reviews.map((review: any, index: number) => (
        <div
          key={review.id}
          className="
            group relative rounded-2xl border border-gray-100
            bg-gradient-to-br from-gray-50 to-white p-5
            hover:shadow-lg hover:-translate-y-1
            transition-all duration-300
            animate-fade-in
          "
          style={{
            animationDelay: `${index * 80}ms`,
            animationFillMode: 'both',
          }}
        >
          {/* top row */}
          <div className="flex items-start justify-between gap-4 mb-3">

            {/* user */}
            <div className="flex items-center gap-3">
              <div
                className="
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm
                  transition-transform duration-300 group-hover:scale-110
                "
                style={{ backgroundColor: settings.primaryColor }}
              >
                {review.role?.charAt(0)?.toUpperCase() || 'R'}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {isRtl ? 'تقييم جديد' : 'New Review'}
                </h3>

                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleString(
                    isRtl ? 'ar-EG' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </p>
              </div>
            </div>

            {/* rating */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`
                    w-4 h-4 transition-all duration-300
                    ${star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400 scale-110'
                      : 'text-gray-300'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* comment */}
          <p className="
            text-sm text-gray-700 leading-relaxed
            bg-white p-3 rounded-xl border border-gray-100
            transition-all duration-300
            group-hover:border-gray-200
          ">
            {review.comment || (isRtl ? 'لا يوجد تعليق' : 'No comment')}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3 animate-bounce">
        <Star className="w-6 h-6 text-gray-300" />
      </div>

      <p className="text-gray-500">
        {isRtl ? 'لا توجد تقييمات حالياً' : 'No reviews yet'}
      </p>
    </div>
  )}
</div>
        </div>
      </div>

      <SubscribePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  );
}
