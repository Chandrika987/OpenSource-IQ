import { AlertCircle, Calendar, CheckCircle2, ExternalLink, MessageCircle, Tag, User } from 'lucide-react';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

const getLabelColor = (color) => `#${color || '6366f1'}`;

export default function IssueCard({ issue }) {
  const isOpen = issue.state === 'open';

  return (
    <article className="glass-panel group flex min-h-72 flex-col justify-between border-white/5 p-5 transition-colors hover:border-primary-400/30 hover:bg-surface/80">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                  isOpen
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border-violet-400/20 bg-violet-400/10 text-violet-300'
                }`}
              >
                {isOpen ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {issue.state}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                #{issue.number}
              </span>
            </div>
            <a
              href={issue.url}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 text-lg font-semibold leading-6 text-white transition-colors group-hover:text-primary-300"
            >
              {issue.title}
            </a>
            <p className="mt-2 truncate text-sm text-gray-400">{issue.repositoryName}</p>
          </div>
          <a
            href={issue.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Open issue ${issue.number} on GitHub`}
          >
            <ExternalLink size={17} />
          </a>
        </div>

        <div className="mb-5 flex min-h-9 flex-wrap gap-2">
          {issue.labels.length ? (
            issue.labels.slice(0, 5).map((label) => (
              <span
                key={label.id || label.name}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-white"
                style={{
                  borderColor: `${getLabelColor(label.color)}55`,
                  backgroundColor: `${getLabelColor(label.color)}22`,
                }}
              >
                <Tag size={12} />
                <span className="truncate">{label.name}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No labels</span>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-4 text-sm text-gray-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <User size={15} className="text-primary-400" />
            {issue.author.login}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={15} className="text-cyan-400" />
            {issue.comments}
          </span>
        </div>
        <div className="grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            Created {formatDate(issue.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 sm:justify-end">
            <Calendar size={14} />
            Updated {formatDate(issue.updatedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
