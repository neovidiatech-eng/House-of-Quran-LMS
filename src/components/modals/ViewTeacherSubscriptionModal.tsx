import { X, Mail, Phone, Globe, User, Calendar, Clock, CheckCircle, GraduationCap, ListTree } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WhatsAppPhone from '../ui/WhatsAppPhone';
import { TeacherSubscriptionRequest } from '../../types/teacherSubscription';

interface ViewTeacherSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TeacherSubscriptionRequest | null;
  onApprove?: (req: TeacherSubscriptionRequest) => void;
}

export default function ViewTeacherSubscriptionModal({
  isOpen,
  onClose,
  request,
  onApprove,
}: ViewTeacherSubscriptionModalProps) {
  const { language, t } = useLanguage();

  if (!isOpen || !request) return null;

  const name = request.name || request.user?.name || '-';
  const email = request.email || request.user?.email || '-';
  const phone = request.phone || request.user?.phone || '';
  const codeCountry = request.codeCountry || request.code_country || request.user?.code_country || '+20';
  const country = request.country || request.user?.country || '-';
  const city = request.city || request.user?.city || '';
  const nationality = request.nationality || request.user?.nationality || '-';
  const age = request.age || request.user?.age || '-';
  const regDate = request.createdAt || request.user?.createdAt;
  const notes = request.notes || '';
  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-start"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'تفاصيل طلب تسجيل المعلم' : 'Teacher Request Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Avatar and Main Info */}
          <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
              <span className="inline-block mt-1.5 px-3.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                {language === 'ar' ? 'طلب تسجيل معلم جديد' : 'New Teacher Signup Request'}
              </span>
            </div>
          </div>

          {/* Detailed Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                  {t('email')}
                </label>
                <p className="text-sm font-medium text-gray-900 break-all">{email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-green-100 text-green-600 rounded-lg shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                  {t('phone')}
                </label>
                <WhatsAppPhone phone={`${codeCountry} ${phone}`.trim()} className="text-sm font-medium text-gray-900" />
              </div>
            </div>

            {/* Country / City */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                  {t('country')} / {language === 'ar' ? 'المدينة' : 'City'}
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {country} {city ? `(${city})` : ''}
                </p>
              </div>
            </div>

            {/* Nationality */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                  {t('nationality')}
                </label>
                <p className="text-sm font-medium text-gray-900">{nationality}</p>
              </div>
            </div>

            {/* Age */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                  {language === 'ar' ? 'السن' : 'Age'}
                </label>
                <p className="text-sm font-medium text-gray-900">{age}</p>
              </div>
            </div>

            {/* Registration Date */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2.5 bg-teal-100 text-teal-600 rounded-lg shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                  {language === 'ar' ? 'تاريخ طلب التسجيل' : 'Request Date'}
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {regDate ? new Date(regDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}
                </p>
              </div>
            </div>
            {notes && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-lg shrink-0">
                  <ListTree className="w-5 h-5" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-0.5">
                    {language === 'ar' ? 'الملاحظات' : 'Notes'}
                  </label>
                  <p className="text-sm font-medium text-gray-900">{notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl transition-colors font-medium text-sm"
          >
            {t('close')}
          </button>
          {onApprove && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onApprove(request);
              }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2 shadow-lg shadow-green-600/20"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{language === 'ar' ? 'قبول واعتماد' : 'Approve'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
