import { useState, useMemo } from 'react';
import { FileText, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useGetMyViolations } from '../hooks/useViolations';
import { useViolations } from '../../admin/hooks/useViolations';
import { ViolationItem, NormalizedViolation } from '../../../types/Violations';

import ViolationHeader from '../components/violations/ViolationHeader';
import ViolationStatCards from '../components/violations/ViolationStatCards';
import ViolationFilterToolbar from '../components/violations/ViolationFilterToolbar';
import ViolationGridView from '../components/violations/ViolationGridView';
import ViolationTableView from '../components/violations/ViolationTableView';
import ViolationDetailModal from '../components/violations/ViolationDetailModal';
import ViolationRulesCatalog from '../components/violations/ViolationRulesCatalog';

export default function Violations() {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor || '#4f46e5';

  const [activeTab, setActiveTab] = useState<'history' | 'catalog'>('history');
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'penalty'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedViolation, setSelectedViolation] = useState<NormalizedViolation | null>(null);

  // Queries
  const {
    data: myViolationsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetMyViolations();

  const { data: catalogData, isLoading: isCatalogLoading } = useViolations();

  // Normalize my violations data list
  const normalizedList = useMemo<NormalizedViolation[]>(() => {
    if (!myViolationsData) return [];

    let rawList: any[] = [];
    const payload = myViolationsData as any;

    if (Array.isArray(payload?.data)) {
      rawList = payload.data;
    } else if (Array.isArray(payload?.data?.violations)) {
      rawList = payload.data.violations;
    } else if (Array.isArray(payload?.data?.items)) {
      rawList = payload.data.items;
    } else if (Array.isArray(payload?.items)) {
      rawList = payload.items;
    } else if (Array.isArray(payload?.violations)) {
      rawList = payload.violations;
    } else if (Array.isArray(payload)) {
      rawList = payload;
    }

    return rawList.map((item, index) => {
      const type: 'warning' | 'penalty' =
        item.type || item.defaultType || (item.deductionAmount > 0 ? 'penalty' : 'warning');

      let title = '';
      if (item.infractionItem) {
        title = isRtl
          ? item.infractionItem.title_ar || item.infractionItem.title_en || item.title_ar
          : item.infractionItem.title_en || item.infractionItem.title_ar || item.title_en;
      } else {
        title = isRtl
          ? item.title_ar || item.title_en || item.reason
          : item.title_en || item.title_ar || item.reason;
      }

      if (!title) {
        title =
          type === 'penalty'
            ? isRtl
              ? 'مخالفة / خصم مالي'
              : 'Penalty / Financial Deduction'
            : isRtl
            ? 'تحذير تنظيمي'
            : 'Warning Notice';
      }

      const reason =
        item.reason || item.description || (isRtl ? 'لا يوجد تفاصيل إضافية' : 'No additional details provided');
      const deductionAmount = item.deductionAmount ?? item.defaultDeductionAmount ?? 0;
      const createdAt = item.createdAt || item.date || new Date().toISOString();
      const supervisorName = item.supervisor?.name || item.supervisorId || (isRtl ? 'إدارة المنصة' : 'Management');

      return {
        id: item.id || `v-${index}`,
        type,
        title,
        reason,
        deductionAmount,
        createdAt,
        supervisorName,
        raw: item,
      };
    });
  }, [myViolationsData, isRtl]);

  // Catalog rules list
  const catalogItems = useMemo<ViolationItem[]>(() => {
    if (!catalogData) return [];
    const payload = catalogData as any;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    if (Array.isArray(payload)) return payload;
    return [];
  }, [catalogData]);

  // Filtered list
  const filteredViolations = useMemo(() => {
    return normalizedList.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supervisorName && item.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [normalizedList, filterType, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = normalizedList.length;
    const warnings = normalizedList.filter((v) => v.type === 'warning').length;
    const penalties = normalizedList.filter((v) => v.type === 'penalty').length;
    const totalDeductions = normalizedList.reduce((acc, curr) => acc + (curr.deductionAmount || 0), 0);

    return { total, warnings, penalties, totalDeductions };
  }, [normalizedList]);

  return (
    <div className="space-y-6 animate-fade-in pb-12" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <ViolationHeader onRefresh={() => refetch()} isFetching={isFetching} />

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={{
            borderColor: activeTab === 'history' ? primaryColor : 'transparent',
            color: activeTab === 'history' ? primaryColor : undefined,
          }}
        >
          <FileText className="w-4 h-4" />
          <span>{isRtl ? 'سجل مخالفاتي' : 'My History'}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
            {normalizedList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={{
            borderColor: activeTab === 'catalog' ? primaryColor : 'transparent',
            color: activeTab === 'catalog' ? primaryColor : undefined,
          }}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isRtl ? 'لائحة وقواعد المخالفات' : 'Rules & Guidelines'}</span>
        </button>
      </div>

      {activeTab === 'history' ? (
        <>
          {/* Summary Stat Cards */}
          <ViolationStatCards metrics={metrics} />

          {/* Filter & Toolbar */}
          <ViolationFilterToolbar
            filterType={filterType}
            setFilterType={setFilterType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            metrics={metrics}
          />

          {/* Main Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-6 bg-gray-200 rounded-full" />
                    <div className="w-16 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="w-3/4 h-5 bg-gray-200 rounded" />
                  <div className="w-full h-12 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <p className="font-semibold">{isRtl ? 'حدث خطأ أثناء تحميل سجل المخالفات' : 'Failed to load violations history'}</p>
              <p className="text-xs text-red-600">{(error as any)?.message || ''}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                {isRtl ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : filteredViolations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {isRtl ? 'لا توجد مخالفات أو تحذيرات مسجلة' : 'No Violations or Warnings Found'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {isRtl
                  ? 'سجلك نظيف خالي من أي مخالفات أو خصومات. استمر في الأداء المتميز!'
                  : 'Your account is in good standing with no penalties or warnings logged.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <ViolationGridView violations={filteredViolations} onSelectViolation={setSelectedViolation} />
          ) : (
            <ViolationTableView violations={filteredViolations} onSelectViolation={setSelectedViolation} />
          )}
        </>
      ) : (
        /* Rules Catalog Tab */
        <ViolationRulesCatalog catalogItems={catalogItems} isLoading={isCatalogLoading} />
      )}

      {/* Item Detail Modal */}
      <ViolationDetailModal violation={selectedViolation} onClose={() => setSelectedViolation(null)} />
    </div>
  );
}
