import { ArrowDownAZ, Code2, GitFork, RefreshCw, Star } from 'lucide-react';

const sortOptions = [
  { value: 'updated', label: 'Recently Updated', icon: RefreshCw },
  { value: 'stars', label: 'Stars', icon: Star },
  { value: 'forks', label: 'Forks', icon: GitFork },
  { value: 'name', label: 'Name', icon: ArrowDownAZ },
];

export default function RepositoryFilters({ languages, selectedLanguage, sortBy, onLanguageChange, onSortChange }) {
  return (
    <div className="glass-panel grid gap-4 border-white/5 p-4 lg:grid-cols-[minmax(180px,260px)_1fr] lg:items-center">
      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <Code2 size={16} className="text-primary-400" />
          Language
        </span>
        <select
          value={selectedLanguage}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          <option value="all">All languages</option>
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-gray-300">Sort by</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange(option.value)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors sm:text-sm ${
                  isActive
                    ? 'border-primary-400/40 bg-primary-500/15 text-primary-200'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={15} />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
