import { ArrowDownWideNarrow, CheckCircle2, Code2, FolderKanban, Layers3, Signal, Tag } from 'lucide-react';

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'comments', label: 'Most Comments' },
];

export default function IssueFilters({
  status,
  repositories,
  labels,
  techStacks,
  domains,
  difficulties,
  selectedRepository,
  selectedLabel,
  selectedTechStack,
  selectedDomain,
  selectedDifficulty,
  sortBy,
  onStatusChange,
  onRepositoryChange,
  onLabelChange,
  onTechStackChange,
  onDomainChange,
  onDifficultyChange,
  onSortChange,
}) {
  return (
    <div className="glass-panel grid gap-4 border-white/5 p-4 xl:grid-cols-[1fr_200px_200px_200px] 2xl:grid-cols-[1fr_190px_190px_190px_190px_190px_190px] xl:items-end">
      <div className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <CheckCircle2 size={16} className="text-primary-400" />
          Status
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ].map((option) => (
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
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <FolderKanban size={16} className="text-primary-400" />
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
          <Code2 size={16} className="text-primary-400" />
          Tech stack
        </span>
        <select
          value={selectedTechStack}
          onChange={(event) => onTechStackChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          <option value="all">All stacks</option>
          {techStacks.map((tech) => (
            <option key={tech.value} value={tech.value}>
              {tech.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <Layers3 size={16} className="text-primary-400" />
          Domain
        </span>
        <select
          value={selectedDomain}
          onChange={(event) => onDomainChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          <option value="all">All domains</option>
          {domains.map((domain) => (
            <option key={domain.value} value={domain.value}>
              {domain.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <Signal size={16} className="text-primary-400" />
          Difficulty
        </span>
        <select
          value={selectedDifficulty}
          onChange={(event) => onDifficultyChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          <option value="all">All levels</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty.value} value={difficulty.value}>
              {difficulty.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-300">
          <Tag size={16} className="text-primary-400" />
          Label
        </span>
        <select
          value={selectedLabel}
          onChange={(event) => onLabelChange(event.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-primary-400/60"
        >
          <option value="all">All labels</option>
          {labels.map((label) => (
            <option key={label} value={label}>
              {label}
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
