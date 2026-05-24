import { useLanguage } from '../../contexts/LanguageContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useCreateRequest } from '../../features/student/hooks/useRequests';
import { RequestType, RequestedData } from '../../types/requests';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import CustomTimePicker from '../ui/CustomTime';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  sessionTitle?: string;
}

export default function CreateRequestModal({ isOpen, onClose, sessionId, sessionTitle }: CreateRequestModalProps) {
  const { language } = useLanguage();
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const isRtl = i18n.language.split('-')[0] === 'ar';

  const [type, setType] = useState<RequestType>('reschedule');
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: createRequest, isPending } = useCreateRequest();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    const requestedData: RequestedData = {
      new_start_time: type === 'reschedule' ? `${selectedDate}T${startTime}:00` : new Date().toISOString(),
      new_end_time: type === 'reschedule' ? `${selectedDate}T${endTime}:00` : new Date().toISOString(),
      suggested_notes: notes
    };

    createRequest({
      sessionId,
      type,
      reason,
      requestedData
    }, {
      onSuccess: () => {
        onClose();
        // Reset form
        setReason('');
        setSelectedDate('');
        setStartTime('');
        setEndTime('');
        setNotes('');
      }
    });
  };

  const typeOptions = [
    { value: 'reschedule', label: isRtl ? 'إعادة جدولة' : 'Reschedule' },
    { value: 'cancel', label: isRtl ? 'إلغاء الحصة' : 'Cancel Session' },
    { value: 'other', label: isRtl ? 'أخرى' : 'Other' },
  ];

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center" style={{ backgroundColor: settings.primaryColor }}>
          <h2 className="text-lg font-bold text-white">
            {isRtl ? 'تقديم طلب ' : 'Add Request'}
            {sessionTitle && <span className="block text-sm font-normal opacity-90">{sessionTitle}</span>}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <CustomSelect
              label={isRtl ? 'نوع الطلب' : 'Request Type'}
              value={type}
              onChange={(val) => setType(val as RequestType)}
              options={typeOptions}
            />

            {type === 'reschedule' && (
              <>
                <DatePickerField
                  label={isRtl ? 'التاريخ الجديد' : 'New Date'}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder={isRtl ? 'اختر التاريخ' : 'Select Date'}

                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomTimePicker
                    label={isRtl ? 'الوقت الجديد (بداية)' : 'New Start Time'}
                    value={startTime}
                    onChange={setStartTime}
                    required
                  />
                  <CustomTimePicker
                    label={isRtl ? 'الوقت الجديد (نهاية)' : 'New End Time'}
                    value={endTime}
                    onChange={setEndTime}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 text-start">
                {isRtl ? 'السبب / التفاصيل' : 'Reason / Details'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={isRtl ? 'لماذا تريد تقديم هذا الطلب؟' : 'Why are you submitting this request?'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none text-start"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 text-start">
                {isRtl ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRtl ? 'أي ملاحظات أخرى...' : 'Any other notes...'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent text-start"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90 shadow-sm ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: settings.primaryColor }}
            >
              {isPending ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال الطلب' : 'Submit Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
