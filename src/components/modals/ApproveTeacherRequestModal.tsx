import { X, CheckCircle, UserCheck, Link as LinkIcon, DollarSign, BookOpen } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import { CustomCheckbox } from '../ui/CustomCheckbox';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { useSubjects } from '../../features/admin/hooks/useSubjects';
import { TeacherSubscriptionRequest, ApproveTeacherRequestBody } from '../../types/teacherSubscription';

interface ApproveTeacherRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApproveTeacherRequestBody) => Promise<void>;
  request: TeacherSubscriptionRequest | null;
  isSubmitting?: boolean;
}

export default function ApproveTeacherRequestModal({
  isOpen,
  onClose,
  onSubmit,
  request,
  isSubmitting = false,
}: ApproveTeacherRequestModalProps) {
  const { language, t } = useLanguage();
  const { data: currenciesData } = useCurrency();
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects();

  const [currencyId, setCurrencyId] = useState('');
  const [hourPrice, setHourPrice] = useState('30');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [meetingLink, setMeetingLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currencyOptions = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies.map(c => ({
      value: c.id,
      label: language === 'ar' ? `${c.name_ar} (${c.symbol})` : `${c.name_en} (${c.code})`
    }));
  }, [currenciesData, language]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (currenciesData?.currencies && currenciesData.currencies.length > 0) {
        const defaultCurrency = currenciesData.default || currenciesData.currencies[0];
        setCurrencyId(defaultCurrency.id);
      }
    }
  }, [isOpen, currenciesData]);

  if (!isOpen || !request) return null;

  const teacherName = request.name || request.user?.name || '-';
  const teacherEmail = request.email || request.user?.email || '-';

  const handleSubjectToggle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, id]);
    } else {
      setSelectedSubjects(prev => prev.filter(s => s !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currencyId) {
      setErrorMessage(language === 'ar' ? 'يرجى اختيار العملة' : 'Please select a currency');
      return;
    }
    if (!hourPrice || Number(hourPrice) <= 0) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال سعر الساعة بشكل صحيح' : 'Please enter a valid hour price');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMessage(language === 'ar' ? 'يرجى اختيار مادة واحدة على الأقل' : 'Please select at least one subject');
      return;
    }

    const payload: ApproveTeacherRequestBody = {
      currency_id: currencyId,
      hour_price: String(hourPrice),
      subject_ids: selectedSubjects,
      ...(meetingLink.trim() ? { meeting_link: meetingLink.trim() } : {}),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const backendError = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      const msg = typeof backendError === 'string'
        ? backendError
        : (language === 'ar' ? 'حدث خطأ أثناء اعتماد الطلب' : 'An error occurred while approving request');
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-start"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6" />
            <span>{language === 'ar' ? 'اعتماد طلب تسجيل المعلم' : 'Approve Teacher Registration'}</span>
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            {/* Teacher Info Card */}
            <div className="bg-primary-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-900 text-base">{teacherName}</p>
                <p className="text-xs text-blue-700 mt-0.5">{teacherEmail}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {language === 'ar' ? 'معلم جديد' : 'New Teacher'}
              </span>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Row 1: Currency & Hour Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <CustomSelect
                  label={t('currency')}
                  value={currencyId}
                  options={currencyOptions}
                  onChange={(val) => setCurrencyId(val as string)}
                />
              </div>

              {/* Hour Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'سعر الساعة *' : 'Hourly Price *'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="30"
                  value={hourPrice}
                  onChange={(e) => setHourPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
                  required
                />
              </div>
            </div>

            {/* Row 2: Zoom Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <span>{t('zoomLink') || (language === 'ar' ? 'رابط الزوم' : 'Zoom Link')}</span>
              </label>
              <input
                type="text"
                placeholder="https://zoom.us/j/123456789"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-start"
              />
            </div>

            {/* Row 3: Subjects Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>{t('subject')} *</span>
              </label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-52 overflow-y-auto no-scrollbar">
                {isLoadingSubjects ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(subjectsData?.subjects || []).map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded-xl border border-transparent hover:border-gray-200 transition-all"
                      >
                        <CustomCheckbox
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={(checked) => handleSubjectToggle(subject.id, checked)}
                        />
                        <span className="text-sm font-medium text-gray-800 flex-1 text-start">
                          {language === 'ar' ? subject.name_ar : (subject.name_en || subject.name_ar)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium text-sm transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-white px-6 py-3 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{language === 'ar' ? 'تأكيد القبول والتفعيل' : 'Approve & Activate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
