import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { useLanguage } from '../../contexts/LanguageContext';

interface WhatsAppPhoneProps {
  phone: string;
  className?: string;
  showIcon?: boolean;
}

export default function WhatsAppPhone({ phone, className = '', showIcon = false }: WhatsAppPhoneProps) {
  const { language } = useLanguage();

  return (
    <button
      onClick={() => openWhatsApp(phone)}
      className={`inline-flex items-center gap-1.5 text-sm font-mono hover:text-green-600 hover:underline transition-colors cursor-pointer ${className}`}
      title={language === 'ar' ? 'فتح واتساب' : 'Open WhatsApp'}
    >
      {showIcon && <MessageCircle className="w-4 h-4" />}
      <span>{typeof phone === 'string' || typeof phone === 'number' ? phone : ''}</span>
    </button>
  );
}
