import { Activity, AlertCircle, BarChart3 } from 'lucide-react';

const InsightPanel = ({ title, icon: Icon, children }) => (
  <section className="glass-panel border-white/5 p-5">
    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
      <Icon size={19} className="text-primary-400" />
      {title}
    </h3>
    {children}
  </section>
);

export default function IssueInsights({ mostActiveRepository, highestOpenRepositories, distribution }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <InsightPanel title="Most Active Repository" icon={Activity}>
        {mostActiveRepository ? (
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
            <p className="truncate text-lg font-semibold text-white">{mostActiveRepository.repository}</p>
            <p className="mt-2 text-sm text-gray-400">{mostActiveRepository.count} total issues tracked</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No repository issue activity found.</p>
        )}
      </InsightPanel>

      <InsightPanel title="Highest Open Issues" icon={AlertCircle}>
        {highestOpenRepositories.length ? (
          <div className="space-y-3">
            {highestOpenRepositories.map((repo, index) => (
              <div
                key={repo.repository}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="min-w-0 truncate text-sm text-gray-200">
                  <span className="mr-2 text-gray-500">{index + 1}.</span>
                  {repo.repository}
                </span>
                <span className="shrink-0 text-xs font-semibold text-emerald-300">{repo.open} open</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No open issues found.</p>
        )}
      </InsightPanel>

      <InsightPanel title="Issue Distribution" icon={BarChart3}>
        {distribution.length ? (
          <div className="space-y-3">
            {distribution.slice(0, 6).map((repo) => (
              <div key={repo.repository}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-gray-300">{repo.repository}</span>
                  <span className="text-gray-500">{repo.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-primary-400" style={{ width: `${repo.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No issue distribution available.</p>
        )}
      </InsightPanel>
    </div>
  );
}
