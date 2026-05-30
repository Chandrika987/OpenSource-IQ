import { AlertCircle, Calendar, ExternalLink, GitFork, Globe2, Lock, Star } from 'lucide-react';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

export default function RepositoryCard({ repository }) {
  const visibilityIcon =
    repository.visibility === 'public' ? <Globe2 size={14} /> : <Lock size={14} />;

  return (
    <article className="glass-panel group flex min-h-72 flex-col justify-between border-white/5 p-5 transition-colors hover:border-primary-400/30 hover:bg-surface/80">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a
              href={repository.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-lg font-semibold text-white transition-colors group-hover:text-primary-300"
            >
              {repository.name}
            </a>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs capitalize text-gray-300">
                {visibilityIcon}
                {repository.visibility}
              </span>
              {repository.isFork && (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200">
                  Fork
                </span>
              )}
            </div>
          </div>
          <a
            href={repository.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Open ${repository.name} on GitHub`}
          >
            <ExternalLink size={17} />
          </a>
        </div>

        <p className="mb-5 line-clamp-3 min-h-16 text-sm leading-6 text-gray-400">
          {repository.description || 'No repository description provided.'}
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
            {repository.language}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star size={15} className="text-amber-400" />
            {repository.stars}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork size={15} className="text-emerald-400" />
            {repository.forks}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AlertCircle size={15} className="text-rose-400" />
            {repository.openIssues}
          </span>
        </div>

        <div className="grid gap-2 border-t border-white/10 pt-4 text-xs text-gray-500 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            Created {formatDate(repository.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 sm:justify-end">
            <Calendar size={14} />
            Updated {formatDate(repository.updatedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
