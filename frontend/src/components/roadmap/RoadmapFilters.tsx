
interface RoadmapFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: 'all' | 'in_progress' | 'completed' | 'not_started';
  onStatusChange: (status: 'all' | 'in_progress' | 'completed' | 'not_started') => void;
  sortBy: 'default' | 'progress_desc' | 'progress_asc' | 'hours_desc';
  onSortChange: (sort: 'default' | 'progress_desc' | 'progress_asc' | 'hours_desc') => void;
  categories: string[];
}

export default function RoadmapFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  categories,
}: RoadmapFiltersProps) {
  return (
    <div className="glass-card p-5 rounded-2xl space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search concepts (e.g. Operating Systems, Paging, Dynamic Programming, Docker)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'in_progress', label: '⏳ In Progress' },
              { key: 'completed', label: '✅ Mastered' },
              { key: 'not_started', label: '⭕ Not Started' },
            ] as const
          ).map((status) => (
            <button
              key={status.key}
              onClick={() => onStatusChange(status.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === status.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="default">Syllabus Flow</option>
            <option value="progress_desc">Progress: High to Low</option>
            <option value="progress_asc">Progress: Low to High</option>
            <option value="hours_desc">Hours: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Domain:</span>
        <button
          onClick={() => onCategoryChange('All')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          All Domains
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
