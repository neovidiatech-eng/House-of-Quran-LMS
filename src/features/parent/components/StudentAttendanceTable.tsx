import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Calendar, Clock, Book, CheckSquare, UserCheck, AlertCircle } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AttendanceLog } from '../../../types/studentDashboard';
import { useStudentAttendance } from '../hooks/useStudentSessions';
import { formatDateTime } from '../utils/tableHelpers';

interface Props {
  studentId: string;
}

export default function StudentAttendanceTable({ studentId }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, isError } = useStudentAttendance(studentId);

  if (isLoading) return <TableSkeleton rows={5} columns={6} />;
  if (isError) return <div className="p-6 text-center text-red-500">{isRtl ? 'حدث خطأ' : 'Error'}</div>;

  const logs: AttendanceLog[] = Array.isArray(data) ? data : (data as any)?.data || [];
  
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('sessionTitleLabel')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('subjectLabel', 'المادة')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('dateTime')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'الطالب' : 'Student'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{isRtl ? 'المعلم' : 'Teacher'}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-4 text-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900">
                        {log.schedule?.title || '-'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {log.schedule?.day_of_week || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Book className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {log.schedule?.subject ? (isRtl ? log.schedule.subject.name_ar : log.schedule.subject.name_en) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start text-gray-700">
                     <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {log.schedule?.start_time ? formatDateTime(log.schedule.start_time, isRtl).date : '-'}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.joinTime_student ? formatDateTime(log.joinTime_student, isRtl).time : isRtl ? 'لم ينضم' : 'No Join Time'}
                      </span>
                      <span className="inline-flex items-center w-fit text-[11px] bg-primary-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {log.duration_student ? Math.round(log.duration_student) + ' ' + t('minutes') : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {log.joinTime_teacher ? formatDateTime(log.joinTime_teacher, isRtl).time : isRtl ? 'لم ينضم' : 'No Join Time'}
                      </span>
                      <span className="inline-flex items-center w-fit text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {log.duration_teacher ? Math.round(log.duration_teacher) + ' ' + t('minutes') : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
                      log.isStudentAttended 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {log.isStudentAttended ? <UserCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {log.isStudentAttended ? (isRtl ? 'حاضر' : 'Attended') : (isRtl ? 'غائب' : 'Missed')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <CheckSquare className="w-12 h-12 text-gray-200" />
                    <p className="text-lg">{isRtl ? 'لا يوجد سجل حضور مسجل' : 'No attendance logs found'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {logs.length > itemsPerPage && (
        <div className="bg-white p-4 border-t border-gray-100 rounded-b-xl">
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={logs.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
