import { Calendar, CheckCircle2, ExternalLink, GitPullRequest, MessageCircle, User, XCircle } from 'lucide-react';

const formatDate = (date) => {
  if (!date) return 'N/A';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const statusConfig = {
  open: {
    icon: GitPullRequest,
    label: 'Open',
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  },
  closed: {
    icon: XCircle,
    label: 'Closed',
    className: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  },
  merged: {
    icon: CheckCircle2,
    label: 'Merged',
    className: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  },
};

export default function PullRequestCard({ pullRequest }) {
  const config = statusConfig[pullRequest.status] || statusConfig.closed;
  const StatusIcon = config.icon;

  return (
    <article className="glass-panel group flex min-h-72 flex-col justify-between border-white/5 p-5 transition-colors hover:border-primary-400/30 hover:bg-surface/80">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
                <StatusIcon size={14} />
                {config.label}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                #{pullRequest.number}
              </span>
            </div>
            <a
              href={pullRequest.url}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 text-lg font-semibold leading-6 text-white transition-colors group-hover:text-primary-300"
            >
              {pullRequest.title}
            </a>
            <p className="mt-2 truncate text-sm text-gray-400">{pullRequest.repositoryName}</p>
          </div>
          <a
            href={pullRequest.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Open pull request ${pullRequest.number} on GitHub`}
          >
            <ExternalLink size={17} />
          </a>
        </div>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-4 text-sm text-gray-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <User size={15} className="text-primary-400" />
            {pullRequest.author.login}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={15} className="text-cyan-400" />
            {pullRequest.comments}
          </span>
        </div>
        <div className="grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            Created {formatDate(pullRequest.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 sm:justify-end">
            <Calendar size={14} />
            Updated {formatDate(pullRequest.updatedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 sm:col-span-2">
            <CheckCircle2 size={14} />
            Merged {formatDate(pullRequest.mergedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
