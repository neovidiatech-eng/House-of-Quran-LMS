import { useTranslation } from 'react-i18next';
import { Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useSettings } from '../../../contexts/SettingsContext';
import { useGetStudentRequest } from '../hooks/useRequests';

interface StudentRequest {
  id: string;
  type: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  reply?: string;
}

export default function StudentRequests() {
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const isRtl = i18n.language.split('-')[0] === 'ar';
  const { data: requests } = useGetStudentRequest()



  let reqs = requests?.data || [];

  const getStatusBadge = (status: StudentRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {isRtl ? 'مقبول' : 'Approved'}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {isRtl ? 'مرفوض' : 'Rejected'}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {isRtl ? 'قيد الانتظار' : 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{isRtl ? 'الطلبات' : 'Requests'}</h1>

        {/* <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 shadow-sm hover:shadow-md"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Plus className="w-5 h-5" />
          {isRtl ? 'تقديم طلب جديد' : 'Submit New Request'}
        </button> */}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {reqs.map((request) => (
            <div key={request.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${settings.primaryColor}15`, color: settings.primaryColor }}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{request.type}</h3>
                    <p className="text-lg text-gray-500 mt-1">
                      {isRtl ? 'التاريخ:' : 'Date:'} {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {getStatusBadge(request.status)}
              </div>

              <div className="pl-0 sm:pr-14 sm:pl-14">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {isRtl ? 'التفاصيل:' : 'Details:'} <span className="font-normal text-gray-600">{request.reason}</span>
                  </p>
                  {request.adminNotes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {isRtl ? 'رد الإدارة:' : 'Admin Reply:'} <span className="font-normal text-gray-600">{request.adminNotes}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {reqs?.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>{isRtl ? 'لا توجد طلبات سابقة' : 'No previous requests found'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
