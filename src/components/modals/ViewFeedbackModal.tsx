import { X, MessageSquare, Star, User, GraduationCap, Calendar, Clock, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FeedBackItem, Review } from '../../types/feedback';

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedBackItem | null;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
      />
    ))}
    <span className="text-sm font-bold text-yellow-700 ms-1">{rating}/5</span>
  </div>
);

const ReviewCard = ({
  review,
  label,
  icon,
  iconBg,
  language,
}: {
  review: Review | undefined;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  language: string;
}) => {
  const noReview = language === 'ar' ? 'لا يوجد تقييم بعد' : 'No review yet';

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col gap-3">
      {/* Role label */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <span className="font-bold text-gray-800 text-base">{label}</span>
      </div>

      {review ? (
        <>
          {/* Reviewer name */}
          <div className="text-sm text-gray-500">
            {language === 'ar' ? 'بواسطة:' : 'By:'}{' '}
            <span className="font-semibold text-gray-800">{review.reviewer.name}</span>
          </div>

          {/* Stars */}
          <StarRating rating={review.rating} />

          {/* Comment */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 min-h-[70px]">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {review.comment || (language === 'ar' ? 'لا يوجد تعليق' : 'No comment provided')}
            </p>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200 text-center min-h-[80px] flex items-center justify-center">
          <p className="text-gray-400 text-sm">{noReview}</p>
        </div>
      )}
    </div>
  );
};

export default function ViewFeedbackModal({ isOpen, onClose, feedback }: ViewFeedbackModalProps) {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0] || 'en';

  if (!isOpen || !feedback) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const teacherReview = feedback.reviews?.find((r) => r.role === 'teacher');
  const studentReview = feedback.reviews?.find((r) => r.role === 'student');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'missed': return 'bg-red-100 text-red-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    if (language === 'ar') {
      switch (status) {
        case 'completed': return 'مكتملة';
        case 'missed': return 'فائتة';
        case 'scheduled': return 'مجدولة';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar transform transition-all"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white px-6 py-5 flex items-center justify-between rounded-t-2xl z-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">
              {language === 'ar' ? 'تفاصيل التقييمات' : 'Feedback Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Info */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-gray-900">
                {language === 'ar' ? 'معلومات الحصة' : 'Session Info'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Title + Status */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-50">
                <p className="text-xs text-gray-400 mb-1">
                  {language === 'ar' ? 'عنوان الحصة' : 'Session Title'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{feedback.schedule.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(feedback.schedule.status)}`}>
                    {getStatusLabel(feedback.schedule.status)}
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-50">
                <p className="text-xs text-gray-400 mb-1">
                  {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(feedback.schedule.start_time)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span dir="ltr">
                    {formatTime(feedback.schedule.start_time)} – {formatTime(feedback.schedule.end_time)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews — Teacher & Student side by side */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              {language === 'ar' ? 'التقييمات' : 'Reviews'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teacher review */}
              <ReviewCard
                review={teacherReview}
                label={language === 'ar' ? 'تقييم المعلم' : 'Teacher Review'}
                icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
                iconBg="bg-emerald-100"
                language={language}
              />

              {/* Student review */}
              <ReviewCard
                review={studentReview}
                label={language === 'ar' ? 'تقييم الطالب' : 'Student Review'}
                icon={<User className="w-5 h-5 text-amber-600" />}
                iconBg="bg-amber-100"
                language={language}
              />
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-md"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
