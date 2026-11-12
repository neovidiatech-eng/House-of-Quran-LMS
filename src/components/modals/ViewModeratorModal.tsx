import { useMemo } from 'react';
import { X, UserCheck, Mail, Phone, Calendar, Users, GraduationCap, Award, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Moderator } from '../../types/moderator';
import { useModeratorById } from '../../features/admin/hooks/useModerator';
import WhatsAppPhone from '../ui/WhatsAppPhone';

interface ViewModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moderator: Moderator | null;
  moderatorId?: string | null;
}

export default function ViewModeratorModal({ isOpen, onClose, moderator: initialModerator, moderatorId }: ViewModeratorModalProps) {
  const { language, t } = useLanguage();

  const targetId = initialModerator?.id || moderatorId;
  const { data: fetchedData, isLoading, isFetching } = useModeratorById(isOpen && targetId ? targetId : undefined);

  const moderator: Moderator | null = useMemo(() => {
    if (!fetchedData) return initialModerator;

    const resAny = fetchedData as any;
    if (resAny?.data?.moderator) return resAny.data.moderator;
    if (resAny?.data && typeof resAny.data === 'object' && ('id' in resAny.data || 'user' in resAny.data || 'userId' in resAny.data)) {
      return resAny.data as Moderator;
    }
    if (resAny?.id || resAny?.userId || resAny?.user) {
      return resAny as Moderator;
    }

    return initialModerator;
  }, [fetchedData, initialModerator]);

  if (!isOpen || (!moderator && !isLoading)) return null;

  const studentModerators = moderator?.studentModerators || [];
  const isActive = moderator?.status === 'active' || moderator?.user?.status === 'active';

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {moderator?.user?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {moderator?.user?.name || (isLoading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : '-')}
                </h3>
                {isFetching && !isLoading && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-500">{t('moderator') || 'مشرف'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading && !moderator ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              {language === 'ar' ? 'جاري تحميل تفاصيل المشرف...' : 'Loading moderator details...'}
            </p>
          </div>
        ) : moderator ? (
          <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
            {/* Main Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">{t('email')}</div>
                  <div className="text-sm font-medium text-gray-900 truncate" title={moderator.user?.email}>
                    {moderator.user?.email || '-'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('phone')}</div>
                  {moderator.user?.phone ? (
                    <WhatsAppPhone
                      phone={`${moderator.user?.code_country || ''} ${moderator.user?.phone || ''}`}
                      className="text-sm font-medium text-gray-900"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">-</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('gender')}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {moderator.gender === 'male' ? (t('male') || 'ذكر') : (t('female') || 'أنثى')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('assignedStudents') || 'الطلاب المسندين'}</div>
                  <div className="text-sm font-bold text-gray-900">
                    {studentModerators.length} {t('students') || 'طلاب'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('status')}</div>
                  <div>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isActive ? (t('active') || 'نشط') : (t('inactive') || 'غير نشط')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('createdAt')}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {moderator.createdAt ? new Date(moderator.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Students Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span>{t('assignedStudents') || 'الطلاب المسندين'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {studentModerators.length}
                  </span>
                </h4>
              </div>

              {studentModerators.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t('noAssignedStudents') || 'لا يوجد طلاب مسندين لهذا المشرف'}</p>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-start">{t('student') || 'الطالب'}</th>
                          <th className="px-4 py-3 text-start">{t('country') || 'الدولة'}</th>
                          <th className="px-4 py-3 text-start">{t('sessions') || 'الحصص'}</th>
                          <th className="px-4 py-3 text-start">{t('points') || 'النقاط'}</th>
                          <th className="px-4 py-3 text-start">{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {studentModerators.map((sm) => (
                          <tr key={sm.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {sm.student?.user?.name || sm.studentId}
                              </div>
                              {sm.student?.user?.email && (
                                <div className="text-xs text-gray-400">{sm.student.user.email}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {sm.student?.country || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-green-600 font-medium">{sm.student?.sessions_attended || 0} {t('attended') || 'حضر'}</span>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-500">{sm.student?.sessions || 0} {t('total') || 'إجمالي'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Award className="w-3.5 h-3.5" />
                                {sm.student?.points || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  sm.student?.active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {sm.student?.active ? (t('active') || 'نشط') : (t('inactive') || 'غير نشط')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-medium"
          >
            {t('close') || 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
}
