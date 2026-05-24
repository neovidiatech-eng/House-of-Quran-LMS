import { useState, useEffect } from 'react';
import { X, Save, Bell, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getEditSubscriptionSchema, type EditSubscriptionFormData } from '../../lib/schemas/SubscriptionSchema';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    id: string;
    studentName: string;
    planName: string;
    planPrice: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    sessionsRemaining: number;
    totalSessions: number;
  };
  onSave: (updatedSubscription: any) => Promise<void> | void;
}


export default function EditSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSave
}: EditSubscriptionModalProps) {
  const { language, t } = useLanguage();
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<EditSubscriptionFormData>({
    resolver: zodResolver(getEditSubscriptionSchema(t)),
    defaultValues: {
      planName: subscription.planName,
      planPrice: subscription.planPrice,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      totalSessions: subscription.totalSessions,
      sessionsRemaining: subscription.sessionsRemaining
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        planName: subscription.planName,
        planPrice: subscription.planPrice,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
        totalSessions: subscription.totalSessions,
        sessionsRemaining: subscription.sessionsRemaining
      });
      setShowNotificationBox(false);
      setNotificationMessage('');
    }
  }, [isOpen, subscription, reset]);

  const text = {
    title: { ar: 'تعديل الاشتراك', en: 'Edit Subscription' },
    studentName: { ar: 'اسم الطالب', en: 'Student Name' },
    planName: { ar: 'اسم الباقة', en: 'Plan Name' },
    price: { ar: 'السعر', en: 'Price' },
    startDate: { ar: 'تاريخ البدء', en: 'Start Date' },
    endDate: { ar: 'تاريخ الانتهاء', en: 'End Date' },
    status: { ar: 'الحالة', en: 'Status' },
    active: { ar: 'نشط', en: 'Active' },
    expired: { ar: 'منتهي', en: 'Expired' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    totalSessions: { ar: 'إجمالي الحصص', en: 'Total Sessions' },
    remainingSessions: { ar: 'الحصص المتبقية', en: 'Remaining Sessions' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    sendNotification: { ar: 'إرسال تنبيه', en: 'Send Notification' },
    notificationTitle: { ar: 'إرسال رسالة تنبيه', en: 'Send Notification Message' },
    notificationPlaceholder: { ar: 'اكتب رسالة التنبيه هنا...', en: 'Write notification message here...' },
    send: { ar: 'إرسال', en: 'Send' },
    notificationSent: { ar: 'تم إرسال التنبيه بنجاح!', en: 'Notification sent successfully!' }
  };

  if (!isOpen) return null;

  const onSubmitForm = async (data: EditSubscriptionFormData) => {
    try {
      setIsSaving(true);
      await onSave({ ...subscription, ...data });
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNotification = () => {
    if (notificationMessage.trim()) {
      console.log('Sending notification:', {
        to: subscription.studentName,
        message: notificationMessage
      });
      alert(text.notificationSent[language]);
      setNotificationMessage('');
      setShowNotificationBox(false);
    }
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.studentName[language]}
            </label>
            <input
              type="text"
              value={subscription.studentName}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-start cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.planName[language]}
            </label>
            <input
              type="text"
              {...register('planName')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start ${errors.planName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.planName && <p className="mt-1 text-sm text-red-500 text-start">{errors.planName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.price[language]}
            </label>
            <input
              type="text"
              {...register('planPrice')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start ${errors.planPrice ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.planPrice && <p className="mt-1 text-sm text-red-500 text-start">{errors.planPrice.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label={text.startDate[language]}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.startDate?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label={text.endDate[language]}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label={text.status[language]}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'active', label: text.active[language] },
                    { value: 'expired', label: text.expired[language] },
                    { value: 'cancelled', label: text.cancelled[language] }
                  ]}
                  error={errors.status?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.totalSessions[language]}
              </label>
              <input
                type="number"
                {...register('totalSessions', { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start ${errors.totalSessions ? 'border-red-500' : 'border-gray-300'}`}
                min="0"
              />
              {errors.totalSessions && <p className="mt-1 text-sm text-red-500 text-start">{errors.totalSessions.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.remainingSessions[language]}
              </label>
              <input
                type="number"
                {...register('sessionsRemaining', { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start ${errors.sessionsRemaining ? 'border-red-500' : 'border-gray-300'}`}
                min="0"
              />
              {errors.sessionsRemaining && <p className="mt-1 text-sm text-red-500 text-start">{errors.sessionsRemaining.message}</p>}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => setShowNotificationBox(!showNotificationBox)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all font-medium shadow-lg"
            >
              <Bell className="w-5 h-5" />
              {text.sendNotification[language]}
            </button>

            {showNotificationBox && (
              <div className="mt-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 space-y-3 animate-fadeIn">
                <h3 className="text-base font-semibold text-gray-900 text-start">
                  {text.notificationTitle[language]}
                </h3>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder={text.notificationPlaceholder[language]}
                  className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-start resize-none"
                  rows={4}
                />
                <button
                  type="button"
                  onClick={handleSendNotification}
                  disabled={!notificationMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {text.send[language]}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
