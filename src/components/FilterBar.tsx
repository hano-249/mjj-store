import React from 'react';
import { FilterState, PlatformType, PriceRangeType } from '../types';
import { Search, X, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount
}) => {
  const handlePlatformChange = (platform: PlatformType) => {
    onFilterChange({ ...filters, platform });
  };

  const handlePriceRangeChange = (priceRange: PriceRangeType) => {
    onFilterChange({ ...filters, priceRange });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFilterChange({ ...filters, searchQuery });
  };

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      platform: 'all',
      priceRange: 'all'
    });
  };

  const isFiltered =
    filters.searchQuery.trim().length > 0 ||
    filters.platform !== 'all' ||
    filters.priceRange !== 'all';

  return (
    <div className="bg-[#080d21] border border-amber-500/20 rounded-2xl p-3 sm:p-4 mb-8 shadow-xl shadow-black/40">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3.5">
        
        {/* 1. حقل البحث (Search Box) */}
        <div className="relative flex-1 w-full min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن اسم لاعب (ميسي، رونالدو...) أو تشكيلة..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pr-10 pl-9 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. فلتر المنصة: الكل / موبايل / كونسول */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 px-2 shrink-0">
            المنصة:
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'mobile', label: 'موبايل' },
                { id: 'console', label: 'كونسول' }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handlePlatformChange(item.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap active:scale-95 ${
                  filters.platform === item.id
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. فلتر السعر: الكل / أقل من 50 ألف / 50-150 ألف / أكثر من 150 ألف */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 px-2 shrink-0">
            السعر:
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'under-50k', label: 'أقل من 50 ألف' },
                { id: '50k-150k', label: '50 - 150 ألف' },
                { id: 'above-150k', label: 'أكثر من 150 ألف' }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handlePriceRangeChange(item.id)}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap active:scale-95 ${
                  filters.priceRange === item.id
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* زر إعادة ضبط الفلاتر عند تفعيلها */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-400 transition-colors shrink-0 flex items-center justify-center gap-1 text-xs font-semibold"
            title="إلغاء الفلاتر"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="xl:hidden">إعادة ضبط</span>
          </button>
        )}

      </div>
    </div>
  );
};
