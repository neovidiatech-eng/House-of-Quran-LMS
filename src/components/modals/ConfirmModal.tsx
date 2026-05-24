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
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {title || (language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion')}
          </h3>

          <p className="text-gray-500 mb-8">
            {message || t('confirmDelete')}
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText || t('cancel')}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
            >
              {confirmText || t('delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
