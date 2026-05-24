import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WhatsAppPhone from '../ui/WhatsAppPhone';

interface SubscriptionRequest {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  plan: {
    name: string;
    price: number;
    sessionsCount: number;
  };
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface ViewSubscriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SubscriptionRequest;
}

export default function ViewSubscriptionRequestModal({ isOpen, onClose, request }: ViewSubscriptionRequestModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const text = {
    title: { ar: 'تفاصيل طلب الاشتراك', en: 'Subscription Request Details' },
    studentName: { ar: 'اسم الطالب', en: 'Student Name' },
    parentName: { ar: 'ولي الأمر', en: 'Parent Name' },
    phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    plan: { ar: 'الخطة', en: 'Plan' },
    price: { ar: 'السعر', en: 'Price' },
    sessionsCount: { ar: 'عدد الحصص', en: 'Sessions Count' },
    session: { ar: 'حصة', en: 'session' },
    requestDate: { ar: 'تاريخ الطلب', en: 'Request Date' },
    status: { ar: 'الحالة', en: 'Status' },
    notes: { ar: 'ملاحظات', en: 'Notes' },
    close: { ar: 'إغلاق', en: 'Close' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    approved: { ar: 'مقبول', en: 'Approved' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    noNotes: { ar: 'لا توجد ملاحظات', en: 'No notes' }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.studentName[language]}
              </label>
              <p className="text-gray-900 text-lg">{request.studentName}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.parentName[language]}
              </label>
              <p className="text-gray-900 text-lg">{request.parentName}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.phone[language]}
              </label>
              <WhatsAppPhone phone={request.phone} className="text-lg" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.email[language]}
              </label>
              <p className="text-gray-900 text-lg" dir="ltr">{request.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.plan[language]}
              </label>
              <p className="text-gray-900 text-lg">{request.plan.name}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.price[language]}
              </label>
              <p className="text-gray-900 text-lg font-semibold">{request.plan.price}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.sessionsCount[language]}
              </label>
              <p className="text-gray-900 text-lg">
                <span className="font-semibold">{request.plan.sessionsCount}</span> {text.session[language]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.requestDate[language]}
              </label>
              <p className="text-gray-900 text-lg">{request.requestDate}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.status[language]}
              </label>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(request.status)}`}>
                {text[request.status][language]}
              </span>
            </div>
          </div>

          {request.notes && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.notes[language]}
              </label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-900">{request.notes}</p>
              </div>
            </div>
          )}

          {!request.notes && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.notes[language]}
              </label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 italic">{text.noNotes[language]}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            {text.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
