import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Calendar, Clock, Book, Eye } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import ViewSessionModal from '../../../components/modals/ViewSessionModal';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Schedule } from '../../../types/scheduales';
import { useStudentSessions } from '../hooks/useStudentSessions';
import { formatDateTime, calculateDuration, getStatusStyle } from '../utils/tableHelpers';

interface Props {
  studentId: string;
}

export default function StudentSessionsTable({ studentId }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Schedule | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<Schedule[]>([]);

  const { data, isLoading, isError } = useStudentSessions(studentId);

  if (isLoading) return <TableSkeleton rows={5} columns={6} />;
  if (isError) return <div className="p-6 text-center text-red-500">{isRtl ? 'حدث خطأ' : 'Error'}</div>;

  const rawSessions: Schedule[] = Array.isArray(data) ? data : data?.data || data?.sessions || [];
  
  const sessions: Schedule[] = [];
  const seenParents = new Set<string>();
  rawSessions.forEach((schedule: Schedule) => {
    if (schedule.parent_recurring_id) {
      if (!seenParents.has(schedule.parent_recurring_id)) {
        seenParents.add(schedule.parent_recurring_id);
        sessions.push(schedule);
      }
    } else {
      sessions.push(schedule);
    }
  });

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('sessionTitleLabel')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('subjectLabel', 'المادة')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('teacherLabel')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('dateTime')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('status')}</th>
              <th className="px-6 py-5 text-start whitespace-nowrap">{t('actions', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentSessions.length > 0 ? (
              currentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-4 text-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {session.title || (isRtl ? 'حصة دراسية' : 'Session')}
                      </span>
                      {session.is_recurring && (
                        <span className="inline-flex items-center text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md w-fit">
                          {isRtl ? 'متكررة' : 'Recurring'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Book className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {session.subject ? (isRtl ? session.subject.name_ar : session.subject.name_en) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {session.teacher?.user?.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <span className="font-medium">{session.teacher?.user?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">
                    {(() => {
                      const { date, time } = formatDateTime(session.start_time, isRtl);
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {date}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1" dir="ltr">
                              <Clock className="w-3.5 h-3.5" />
                              {time}
                            </span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {calculateDuration(session.start_time, session.end_time)} {t('minutes')}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getStatusStyle(session.status)}`}>
                      {t(session.status?.toLowerCase() || '') || session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <button
                      onClick={() => {
                        const grouped = session.parent_recurring_id
                          ? rawSessions.filter((s: Schedule) => s.parent_recurring_id === session.parent_recurring_id)
                          : [session];
                        setGroupedSessions(grouped);
                        setSelectedSession(session);
                        setShowViewModal(true);
                      }}
                      className="p-2 bg-primary-50/50 text-blue-600 hover:bg-primary hover:text-white hover:shadow-md rounded-xl transition-all duration-300"
                      title={t('view')}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Calendar className="w-12 h-12 text-gray-200" />
                    <p className="text-lg">{isRtl ? 'لا توجد حصص مسجلة' : 'No sessions found'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sessions.length > itemsPerPage && (
        <div className="bg-white p-4 border-t border-gray-100 rounded-b-xl">
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={sessions.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      )}

      <ViewSessionModal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedSession(null); setGroupedSessions([]); }}
        session={selectedSession}
        groupedSessions={groupedSessions}
        allSessions={rawSessions}
      />
    </div>
  );
}
