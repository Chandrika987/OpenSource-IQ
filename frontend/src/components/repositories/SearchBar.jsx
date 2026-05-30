import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
        placeholder="Search repositories"
        className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-primary-400/60 focus:bg-white/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
