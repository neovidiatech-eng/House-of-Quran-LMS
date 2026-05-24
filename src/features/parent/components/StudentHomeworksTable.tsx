import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BookOpen, Calendar, Book } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Homework } from '../../../types/studentDashboard';
import { useStudentHomeworks } from '../hooks/useStudentSessions';
import { formatDateTime, getStatusStyle } from '../utils/tableHelpers';

interface Props {
  studentId: string;
}

export default function StudentHomeworksTable({ studentId }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, isError } = useStudentHomeworks(studentId);

  if (isLoading) return <TableSkeleton rows={5} columns={5} />;
  if (isError) return <div className="p-6 text-center text-red-500">{isRtl ? 'حدث خطأ' : 'Error'}</div>;

  const rawHomeworks: Homework[] = Array.isArray(data) ? data : (data as any)?.data || [];
  
  const totalPages = Math.ceil(rawHomeworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHomeworks = rawHomeworks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'الواجب' : 'Homework'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('subjectLabel', 'المادة')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'المعلم' : 'Teacher'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'تاريخ التسليم' : 'Due Date'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentHomeworks.length > 0 ? (
              currentHomeworks.map((hw) => (
                <tr key={hw.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="px-6 py-4 text-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {hw.title || '-'}
                      </span>
                      <span className="text-xs text-gray-500 max-w-[200px] truncate" title={hw.description}>
                        {hw.description || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Book className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {hw.subject ? (isRtl ? hw.subject.name_ar : hw.subject.name_en) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {hw.teacher?.user?.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <span className="font-medium">{hw.teacher?.user?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">
                    {(() => {
                      const { date } = formatDateTime(hw.dueDate, isRtl);
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {date}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusStyle(hw.status)}`}>
                      {t(hw.status?.toLowerCase() || '') || hw.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <BookOpen className="w-12 h-12 text-gray-200" />
                    <p className="text-lg">{isRtl ? 'لا توجد واجبات مسجلة' : 'No homeworks found'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rawHomeworks.length > itemsPerPage && (
        <div className="bg-white p-4 border-t border-gray-100 rounded-b-xl">
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={rawHomeworks.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
