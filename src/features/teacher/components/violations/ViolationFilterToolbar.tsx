import { AlertTriangle, Ban, Search, LayoutGrid, List } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useSettings } from '../../../../contexts/SettingsContext';

interface Metrics {
  total: number;
  warnings: number;
  penalties: number;
}

interface ViolationFilterToolbarProps {
  filterType: 'all' | 'warning' | 'penalty';
  setFilterType: (type: 'all' | 'warning' | 'penalty') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  metrics: Metrics;
}

export default function ViolationFilterToolbar({
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  metrics,
}: ViolationFilterToolbarProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#4f46e5';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isRtl ? 'الكل' : 'All'} ({metrics.total})
        </button>
        <button
          onClick={() => setFilterType('warning')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterType === 'warning'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {isRtl ? 'تحذيرات' : 'Warnings'} ({metrics.warnings})
        </button>
        <button
          onClick={() => setFilterType('penalty')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterType === 'penalty'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          {isRtl ? 'خصومات ومخالفات' : 'Penalties'} ({metrics.penalties})
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-64">
          <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث في السبب أو العنوان...' : 'Search title or reason...'}
            className={`w-full py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
            style={{ '--tw-ring-color': primaryColor } as any}
          />
        </div>

        <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-gray-50 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            title={isRtl ? 'عرض بطاقات' : 'Grid View'}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            title={isRtl ? 'عرض جدول' : 'Table View'}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
