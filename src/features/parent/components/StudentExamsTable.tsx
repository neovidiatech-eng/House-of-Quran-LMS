import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileText, Calendar, Book, Award, Clock } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { Exam } from '../../../types/studentDashboard';
import { useStudentExams } from '../hooks/useStudentSessions';
import { formatDateTime, getStatusStyle } from '../utils/tableHelpers';
import { Pagination } from 'antd';

interface Props {
  studentId: string;
}

export default function StudentExamsTable({ studentId }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, isError } = useStudentExams(studentId);

  if (isLoading) return <TableSkeleton rows={5} columns={6} />;
  if (isError) return <div className="p-6 text-center text-red-500">{isRtl ? 'حدث خطأ' : 'Error'}</div>;

  const rawExams: Exam[] = Array.isArray(data) ? data : (data as any)?.data || [];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = rawExams.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'الامتحان' : 'Exam Title'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('subjectLabel', 'المادة')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'تاريخ التسليم' : 'Due Date'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'الدرجة' : 'Grade'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'المعلم' : 'Teacher'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentExams.length > 0 ? (
              currentExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-6 py-4 text-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {exam.title || '-'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exam.duration} {t('minutes')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Book className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {exam.subject ? (isRtl ? exam.subject.name_ar : exam.subject.name_en) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">
                    {(() => {
                      const { date } = formatDateTime(exam.dueDate, isRtl);
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Award className={`w-4 h-4 ${exam.grade >= (exam.totalMarks / 2) ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <span>{exam.grade || 0}</span>
                        <span className="text-gray-400 font-normal">/ {exam.totalMarks || 100}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                        {exam.teacher?.user?.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <span className="font-medium">{exam.teacher?.user?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusStyle(exam.status)}`}>
                      {t(exam.status?.toLowerCase() || '') || exam.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <FileText className="w-12 h-12 text-gray-200" />
                    <p className="text-lg">{isRtl ? 'لا توجد امتحانات مسجلة' : 'No exams found'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rawExams.length > itemsPerPage && (
        <div className="bg-white p-4 border-t border-gray-100 rounded-b-xl">
          <Pagination
            current={currentPage}
            total={rawExams.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
