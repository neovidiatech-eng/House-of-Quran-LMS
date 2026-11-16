import { X, MessageSquare, Star, User, GraduationCap, Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FeedBackItem } from '../../types/feedback';

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedBackItem | null;
}

export default function ViewFeedbackModal({ isOpen, onClose, feedback }: ViewFeedbackModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0] || 'en';

  if (!isOpen || !feedback) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar transform transition-all"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="sticky top-0 bg-primary text-white px-6 py-5 flex items-center justify-between rounded-t-2xl z-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{language === 'ar' ? 'تفاصيل التقرير' : 'Report Details'}</h2>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'معلومات الحصة' : 'Session Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-50">
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'عنوان الحصة' : 'Session Title'}</p>
                <p className="font-semibold text-gray-900">{feedback.schedule.title}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-50">
                <p className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {formatDate(feedback.schedule.start_time)}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  <span dir="ltr">{formatTime(feedback.schedule.start_time)} - {formatTime(feedback.schedule.end_time)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* People Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'المعلم' : 'Teacher'}</p>
                  <p className="font-bold text-gray-900">{feedback.role === 'teacher' ? feedback.reviewer.name : feedback.reviewee.name}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'الطالب' : 'Student'}</p>
                  <p className="font-bold text-gray-900">{feedback.role === 'student' ? feedback.reviewer.name : feedback.reviewee.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                {language === 'ar' ? 'التعليق والتقييم' : 'Review & Rating'}
              </h3>
              <div className="flex bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-inner min-h-[100px]">
               <p className="text-sm text-gray-500 mb-2">
                 {language === 'ar' ? `بواسطة: ${feedback.reviewer.name} (${feedback.role === 'teacher' ? 'المعلم' : 'الطالب'})` : `By: ${feedback.reviewer.name} (${feedback.role})`}
               </p>
               <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.comment || (language === 'ar' ? 'لا يوجد تعليق' : 'No comment provided')}</p>
            </div>
          </div>

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
