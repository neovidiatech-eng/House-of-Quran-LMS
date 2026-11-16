import { useState, useMemo } from 'react';
import { X, CheckCircle, XCircle, Loader2, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStudents } from '../../features/admin/hooks/useStudents';

interface ConfirmModeratorRequestModalProps {
  isOpen: boolean;
  type: 'accept' | 'reject' | null;
  isActing?: boolean;
  onConfirm: (studentIds: string[]) => void;
  onClose: () => void;
}

export default function ConfirmModeratorRequestModal({
  isOpen,
  type,
  isActing = false,
  onConfirm,
  onClose,
}: ConfirmModeratorRequestModalProps) {
  const { i18n } = useTranslation();
  const language = i18n?.language?.split('-')[0] || 'ar';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  const { data: studentsResponse } = useStudents({ limit: 1000 }, { enabled: isOpen && type === 'accept' }) as any;
  const allStudents = studentsResponse?.data?.studentsData || [];

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter((s: any) => {
      const name = (s.user?.name ?? '').toLowerCase();
      const email = (s.user?.email ?? '').toLowerCase();
      const phone = (s.user?.phone ?? '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [allStudents, studentSearch]);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClose = () => {
    setSelectedIds([]);
    setStudentSearch('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    setSelectedIds([]);
    setStudentSearch('');
  };

  if (!isOpen || !type) return null;

  const isAccept = type === 'accept';

  return (
    <div
      className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isAccept ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {isAccept ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className={`font-bold text-lg ${isAccept ? 'text-green-700' : 'text-red-700'}`}>
              {isAccept
                ? language === 'ar' ? 'تأكيد القبول' : 'Confirm Acceptance'
                : language === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 text-start">
            {isAccept
              ? language === 'ar'
                ? 'هل أنت متأكد أنك تريد قبول هذا الطلب؟ سيتم تفعيل حساب المشرف.'
                : 'Are you sure you want to accept this request? The moderator account will be activated.'
              : language === 'ar'
              ? 'هل أنت متأكد أنك تريد رفض هذا الطلب؟'
              : 'Are you sure you want to reject this request?'}
          </p>

          {/* ── Students multi-select (accept only) ────────────────────────── */}
          {isAccept && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-green-600" />
                  {language === 'ar' ? 'إسناد طلاب (اختياري)' : 'Assign Students (optional)'}
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                    {selectedIds.length} {language === 'ar' ? 'محدد' : 'selected'}
                  </span>
                )}
              </div>

              {/* Search box */}
              <div className="relative">
                <Search
                  className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`}
                />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all`}
                />
              </div>

              {/* Students list */}
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-gray-100">
                {allStudents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                ) : (
                  filteredStudents.map((student: any) => {
                    const isSelected = selectedIds.includes(student.id);
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors ${
                          isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox */}
                        <span
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>

                        {/* Avatar */}
                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                          {student.user?.name?.charAt(0) || 'S'}
                        </span>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {student.user?.name || '-'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {student.user?.email || student.country || ''}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isActing}
              className={`flex-1 py-2.5 px-4 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 ${
                isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isActing && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAccept
                ? language === 'ar' ? 'تأكيد القبول' : 'Confirm'
                : language === 'ar' ? 'تأكيد الرفض' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
