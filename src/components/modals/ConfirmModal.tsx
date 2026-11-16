import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col items-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title || (isRtl ? 'تأكيد الحذف' : 'Confirm Deletion')}
          </h3>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {message || (isRtl ? 'هل أنت تأكد من رغبتك في الاستمرار؟ لا يمكن التراجع عن هذا الإجراء.' : t('confirmDelete'))}
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              {cancelText || (isRtl ? 'إلغاء' : t('cancel'))}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {confirmText || (isRtl ? 'حذف' : t('delete'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
