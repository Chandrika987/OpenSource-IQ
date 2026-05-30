import { Activity, BarChart3, Star } from 'lucide-react';

const InsightPanel = ({ title, icon: Icon, children }) => (
  <section className="glass-panel border-white/5 p-5">
    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
      <Icon size={19} className="text-primary-400" />
      {title}
    </h3>
    {children}
  </section>
);

const CompactRepoList = ({ repositories, metric }) => (
  <div className="space-y-3">
    {repositories.map((repo, index) => (
      <a
        key={repo.id}
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-primary-400/30 hover:bg-white/10"
      >
        <span className="min-w-0 truncate text-sm text-gray-200">
          <span className="mr-2 text-gray-500">{index + 1}.</span>
          {repo.name}
        </span>
        <span className="shrink-0 text-xs font-semibold text-primary-300">{metric(repo)}</span>
      </a>
    ))}
  </div>
);

export default function RepositoryInsights({ topStarred, recentlyActive, languageBreakdown }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <InsightPanel title="Top 5 By Stars" icon={Star}>
        {topStarred.length ? (
          <CompactRepoList repositories={topStarred} metric={(repo) => `${repo.stars} stars`} />
        ) : (
          <p className="text-sm text-gray-400">No starred repositories yet.</p>
        )}
      </InsightPanel>

      <InsightPanel title="Recently Active" icon={Activity}>
        {recentlyActive.length ? (
          <CompactRepoList
            repositories={recentlyActive}
            metric={(repo) =>
              new Date(repo.updatedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })
            }
          />
        ) : (
          <p className="text-sm text-gray-400">No recent repository activity found.</p>
        )}
      </InsightPanel>

      <InsightPanel title="Language Breakdown" icon={BarChart3}>
        {languageBreakdown.length ? (
          <div className="space-y-3">
            {languageBreakdown.map((item) => (
              <div key={item.language}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-gray-300">{item.language}</span>
                  <span className="text-gray-500">{item.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-primary-400" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No language data available.</p>
        )}
      </InsightPanel>
    </div>
  );
}
