import { ArrowDownWideNarrow, FolderGit2, Search, X } from 'lucide-react';

const statuses = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'merged', label: 'Merged' },
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'comments', label: 'Most Comments' },
];

export default function PullRequestFilters({
  searchQuery,
  status,
  repositories,
  selectedRepository,
  sortBy,
  onSearchChange,
  onStatusChange,
  onRepositoryChange,
  onSortChange,
}) {
  return (
    <div className="glass-panel grid gap-4 border-white/5 p-4 2xl:grid-cols-[minmax(260px,360px)_1fr_220px_220px] 2xl:items-end">
      <div className="relative w-full">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          type="search"
          placeholder="Search PRs or repositories"
          className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-primary-400/60 focus:bg-white/10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statuses.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={`h-10 rounded-lg border px-3 text-sm font-semibold transition-colors ${
              status === option.value
                ? 'border-primary-400/40 bg-primary-500/15 text-primary-200'
                : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <FolderGit2 size={16} className="text-primary-400" />
          Repository
        </span>
        <select
          value={selectedRepository}
          onChange={(event) => onRepositoryChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          <option value="all">All repositories</option>
          {repositories.map((repository) => (
            <option key={repository} value={repository}>
              {repository}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <ArrowDownWideNarrow size={16} className="text-primary-400" />
          Sort
        </span>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
