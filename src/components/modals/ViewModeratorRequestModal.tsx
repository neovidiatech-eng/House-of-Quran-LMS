import {
  X,
  CheckCircle,
  XCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  Laptop,
  Heart,
  Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModeratorRequest } from '../../types/moderator';

interface ViewModeratorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ModeratorRequest | null;
  isActing?: boolean;
  onAccept: (moderatorId: string) => void;
  onReject: (moderatorId: string) => void;
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-start">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

export default function ViewModeratorRequestModal({
  isOpen,
  onClose,
  request,
  isActing = false,
  onAccept,
  onReject,
}: ViewModeratorRequestModalProps) {
  const { i18n } = useTranslation();
  const language = i18n?.language?.split('-')[0] || 'ar';

  if (!isOpen || !request) return null;

  const effectiveStatus = request.moderator?.status || request.status || 'pending';
  const isPending = effectiveStatus === 'pending';

  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'inactive') return 'bg-gray-100 text-gray-600';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusDotClass = (status: string) => {
    if (status === 'active') return 'bg-green-500';
    if (status === 'inactive') return 'bg-gray-400';
    return 'bg-yellow-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return language === 'ar' ? 'نشط' : 'Active';
    if (status === 'inactive') return language === 'ar' ? 'غير نشط' : 'Inactive';
    return language === 'ar' ? 'معلق' : 'Pending';
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  const boolLabel = (val: boolean) =>
    val
      ? language === 'ar' ? 'نعم' : 'Yes'
      : language === 'ar' ? 'لا' : 'No';

  return (
    <div
      className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {language === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Applicant header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase shrink-0">
              {request.name?.charAt(0) || '?'}
            </div>
            <div className="text-start">
              <p className="text-lg font-bold text-gray-900">{request.name}</p>
              <p className="text-sm text-gray-500">{request.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(effectiveStatus)}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(effectiveStatus)}`} />
                {getStatusLabel(effectiveStatus)}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<Phone className="w-4 h-4 text-blue-500" />}
              label={language === 'ar' ? 'الهاتف' : 'Phone'}
              value={`${request.code_country || ''} ${request.phone || ''}`.trim() || '-'}
            />
            <InfoCard
              icon={<Mail className="w-4 h-4 text-purple-500" />}
              label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              value={request.email || '-'}
            />
            <InfoCard
              icon={<MapPin className="w-4 h-4 text-red-500" />}
              label={language === 'ar' ? 'المحافظة' : 'Governorate'}
              value={request.additionalData?.governorate || '-'}
            />
            <InfoCard
              icon={<Heart className="w-4 h-4 text-pink-500" />}
              label={language === 'ar' ? 'الحالة الاجتماعية' : 'Marital Status'}
              value={request.additionalData?.maritalStatus || '-'}
            />
            <InfoCard
              icon={<Calendar className="w-4 h-4 text-orange-500" />}
              label={language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
              value={formatDate(request.additionalData?.birthDate)}
            />
            <InfoCard
              icon={<Calendar className="w-4 h-4 text-gray-400" />}
              label={language === 'ar' ? 'تاريخ الطلب' : 'Request Date'}
              value={formatDate(request.createdAt)}
            />
            <InfoCard
              icon={<GraduationCap className="w-4 h-4 text-indigo-500" />}
              label={language === 'ar' ? 'المؤهل العلمي' : 'Qualification'}
              value={request.additionalData?.qualification || '-'}
            />
            <InfoCard
              icon={<Briefcase className="w-4 h-4 text-teal-500" />}
              label={language === 'ar' ? 'لديه وظيفة حالية' : 'Has Current Job'}
              value={
                request.additionalData != null
                  ? boolLabel(request.additionalData.hasCurrentJob)
                  : '-'
              }
            />
            <InfoCard
              icon={<Laptop className="w-4 h-4 text-cyan-500" />}
              label={language === 'ar' ? 'لديه لابتوب شخصي' : 'Has Personal Laptop'}
              value={
                request.additionalData != null
                  ? boolLabel(request.additionalData.hasPersonalLaptop)
                  : '-'
              }
            />
            <InfoCard
              icon={<Clock className="w-4 h-4 text-yellow-500" />}
              label={language === 'ar' ? 'ساعات الفراغ اليومية' : 'Daily Free Hours'}
              value={request.additionalData?.dailyFreeTimeHours || '-'}
            />
            <InfoCard
              icon={<Clock className="w-4 h-4 text-emerald-500" />}
              label={language === 'ar' ? 'متاح من 3 إلى 8 مساءً' : 'Free 3–8 PM'}
              value={
                request.additionalData != null
                  ? boolLabel(request.additionalData.hasFreeTimeFrom3To8)
                  : '-'
              }
            />
            <InfoCard
              icon={<CheckCircle className="w-4 h-4 text-green-500" />}
              label={language === 'ar' ? 'وافق على شروط العمل' : 'Agreed to Work Conditions'}
              value={
                request.additionalData != null
                  ? boolLabel(request.additionalData.agreedToWorkConditions)
                  : '-'
              }
            />
          </div>

          {/* WhatsApp number */}
          {request.additionalData?.whatsappNumber && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <Phone className="w-4 h-4 text-green-600 shrink-0" />
              <div className="text-start">
                <p className="text-xs text-green-700 font-medium">
                  {language === 'ar' ? 'رقم واتساب' : 'WhatsApp Number'}
                </p>
                <p className="text-sm text-green-800 font-semibold">
                  {request.additionalData.whatsappNumber}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons — pending only */}
          {isPending && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onReject(request.moderator.userId);
                  onClose();
                }}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {language === 'ar' ? 'رفض الطلب' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  onAccept(request.moderator.userId);
                  onClose();
                }}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {language === 'ar' ? 'قبول الطلب' : 'Accept'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
