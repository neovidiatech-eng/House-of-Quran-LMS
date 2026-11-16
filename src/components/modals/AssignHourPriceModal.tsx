import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAssignStudentHourPrice } from '../../features/admin/hooks/useTeacher';

interface AssignHourPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  studentId: string;
  studentName: string;
  currentPrice?: number;
}

export default function AssignHourPriceModal({
  isOpen,
  onClose,
  teacherId,
  studentId,
  studentName,
  currentPrice
}: AssignHourPriceModalProps) {
  const { language, t } = useLanguage();
  const [hourPrice, setHourPrice] = useState<string>('');
  
  const { mutate: assignPrice, isPending } = useAssignStudentHourPrice();

  useEffect(() => {
    if (isOpen) {
      setHourPrice(currentPrice ? currentPrice.toString() : '');
    }
  }, [isOpen, currentPrice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hourPrice || isNaN(Number(hourPrice))) return;
    
    assignPrice(
      { teacherId, studentId, hour_price: hourPrice.toString() },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'تحديد سعر الساعة للطالب' : 'Assign Hour Price for Student'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              {language === 'ar' ? 'الطالب:' : 'Student:'} <span className="font-bold text-gray-900">{studentName}</span>
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'سعر الساعة' : 'Hour Price'}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                min="0"
                step="0.01"
                required
                value={hourPrice}
                onChange={(e) => setHourPrice(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder={language === 'ar' ? 'أدخل السعر' : 'Enter price'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              disabled={isPending}
            >
              {t('cancel') || (language === 'ar' ? 'إلغاء' : 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending || !hourPrice}
              className="px-6 py-2.5 bg-[#31867B] hover:bg-[#31867B]/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('save') || (language === 'ar' ? 'حفظ' : 'Save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
