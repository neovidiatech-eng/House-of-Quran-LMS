import { X, User, Users as UsersIcon, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Parent } from '../../types/parentsAdmin';
import { useGetParentById } from '../../features/admin/hooks/useParents';

interface ViewParentModalProps {
  parent: Parent;
  onClose: () => void;
}

export default function ViewParentModal({ parent, onClose }: ViewParentModalProps) {
  const { language } = useLanguage();
  const { data: fetchedParent } = useGetParentById(parent.id);

  const text = {
    title: { ar: 'تفاصيل ولي الأمر', en: 'Parent Details' },
    personalInfo: { ar: 'المعلومات الشخصية', en: 'Personal Information' },
    name: { ar: 'الاسم الكامل', en: 'Full Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
    phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
    childrenInfo: { ar: 'معلومات الأبناء', en: 'Children Information' },
    numberOfChildren: { ar: 'عدد الأبناء', en: 'Number of Children' },
    studentNames: { ar: 'أسماء الطلاب', en: 'Student Names' },
    noStudents: { ar: 'لا يوجد طلاب مرتبطين', en: 'No linked students' },
    accountInfo: { ar: 'معلومات الحساب', en: 'Account Information' },
    accountStatus: { ar: 'حالة الحساب', en: 'Account Status' },
    active: { ar: 'نشط', en: 'Active' },
    joinDate: { ar: 'تاريخ الانضمام', en: 'Join Date' },
    close: { ar: 'إغلاق', en: 'Close' }
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">{fetchedParent?.name?.charAt(0) || 'P'}</span>
            </div>
            <div className="text-start flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{fetchedParent?.name}</h3>
              <p className="text-gray-600 mt-1">{fetchedParent?.email}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 justify-end">
              {text.personalInfo[language]}
              <User className="w-5 h-5 text-blue-600" />
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">{fetchedParent?.name}</span>
                <span className="text-gray-600 text-sm">{text.name[language]}</span>
              </div>
              <div className="flex justify-between items-center">
                <a href={`mailto:${fetchedParent?.email}`} className="text-blue-600 hover:underline font-medium">
                  {fetchedParent?.email}
                </a>
                <span className="text-gray-600 text-sm">{text.email[language]}</span>
              </div>
              <div className="flex justify-between items-center">
                <a href={`https://wa.me/${fetchedParent?.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
                  {fetchedParent?.phone}
                </a>
                <span className="text-gray-600 text-sm">{text.phone[language]}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 justify-end">
              {text.childrenInfo[language]}
              <UsersIcon className="w-5 h-5 text-blue-600" />
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-semibold text-lg">{fetchedParent?.students?.length || 0}</span>
                <span className="text-gray-600 text-sm">{text.numberOfChildren[language]}</span>
              </div>
              {fetchedParent?.students && fetchedParent.students.length > 0 ? (
                <div>
                  <span className="text-gray-600 text-sm block mb-2 text-start">{text.studentNames[language]}</span>
                  <div className="space-y-2">
                    {fetchedParent?.students.map((student) => (
                      <div key={student.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">{student.user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {text.noStudents[language]}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 justify-end">
              {text.accountInfo[language]}
              <Calendar className="w-5 h-5 text-blue-600" />
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  fetchedParent?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {fetchedParent?.active ? text.active[language] : 'Inactive'}
                </span>
                <span className="text-gray-600 text-sm">{text.accountStatus[language]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">{fetchedParent?.createdAt ? new Date(fetchedParent.createdAt).toLocaleDateString() : '-'}</span>
                <span className="text-gray-600 text-sm">{text.joinDate[language]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            {text.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
