import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WhatsAppPhone from '../ui/WhatsAppPhone';
import { useTranslation } from 'react-i18next';
import { Student } from '../../types/student';
import { useStudentById } from '../../features/admin/hooks/useStudents';
import { useMemo } from 'react';

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: Student | null;
}

export default function ViewStudentModal({ isOpen, onClose, studentData }: ViewStudentModalProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { data: fetchedData } = useStudentById(studentData?.id);

  const student = useMemo(() => {
    if (!fetchedData) return studentData;

    // Robust parsing of different API response formats
    if ('id' in fetchedData && 'user' in fetchedData) {
      return fetchedData as unknown as Student;
    }

    const resData = (fetchedData as any).data;
    if (resData) {
      if ('id' in resData && 'user' in resData) {
        return resData as Student;
      }
      if (resData.student && 'id' in resData.student && 'user' in resData.student) {
        return resData.student as Student;
      }
      if (Array.isArray(resData.studentsData) && resData.studentsData.length > 0) {
        return resData.studentsData[0] as Student;
      }
    }

    return studentData;
  }, [fetchedData, studentData]);

  if (!isOpen || !studentData || !student) return null;

  const totalSessions = Number(student.sessions) || 0;
  const remainSessions = Number(student.sessions_remaining) || 0;
  const scheduledSessions = totalSessions - remainSessions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'تفاصيل الطالب' : 'Student Details'}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">
                  {student.user.name ? student.user.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="text-start flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{student.user.name}</h3>
                <p className="text-gray-600">{student.user.email}</p>
              </div>
            </div>

            {/* Student Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="text-start">
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <p className="text-base text-gray-900">{student.user.email}</p>
              </div>

              {/* Phone */}
              <div className="text-start">
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <WhatsAppPhone
                  phone={`${student.user.code_country} ${student.user.phone}`}
                  className="text-base text-gray-900"
                />
              </div>

              {/* Plan */}
              <div className="text-start">
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {language === 'ar' ? 'الخطة' : 'Plan'}
                </label>
                <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {student.plan?.name_ar || student.plan?.name_en || student.planId || t('noPlan')}
                </span>
              </div>

              {/* Country */}
              <div className="text-start">
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {language === 'ar' ? 'الدولة' : 'Country'}
                </label>
                <p className="text-base text-gray-900">{student.country}</p>
              </div>

              {/* Status */}
              <div className="text-start">
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </label>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${student.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : student.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {student.status === 'approved'
                    ? t('active')
                    : student.status === 'pending'
                      ? t('pending')
                      : t('inactive')}
                </span>
              </div>

              {/* Sessions Info */}
              <div className="text-start">
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {language === 'ar' ? 'الجلسات' : 'Sessions'}
                </label>
                <div className="space-y-1">
                  <p className="text-base text-gray-900">
                    {student.sessions_attended || 0} / {student.sessions || 0} {language === 'ar' ? 'جلسة' : 'sessions'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'ar' ? ' الحصص المتبقية من الخطة :' : 'Remaining Sessions From Plan:'} {student.sessions_remaining || 0}
                  </p>
                     <p className="text-xs text-gray-500">
                    {language === 'ar' ? ' الحصص  المتجدولة  :' : 'Scheduled Sessions:'} {scheduledSessions}
                  </p>


                </div>
              </div>

             
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
