import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  return (
    <button
      onClick={onToggle}
      className={`absolute top-24 ${isRtl ? '-left-4' : '-right-4'} w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-50 group hover:scale-110`}
      title={isCollapsed ? (isRtl ? ' تكبير' : 'Expand') : (isRtl ? 'تصغير' : 'Collapse')}
    >
      {isCollapsed ? (
        isRtl ? <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" /> : <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      ) : (
        isRtl ? <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      )}
    </button>
  );
}
