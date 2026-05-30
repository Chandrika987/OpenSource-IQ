import { Activity, CheckCircle2, MessageCircle, Percent } from 'lucide-react';

const InsightPanel = ({ title, icon: Icon, children }) => (
  <section className="glass-panel border-white/5 p-5">
    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
      <Icon size={19} className="text-primary-400" />
      {title}
    </h3>
    {children}
  </section>
);

export default function PullRequestInsights({ insights }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
      <InsightPanel title="Most Active Repository" icon={Activity}>
        <p className="truncate text-lg font-semibold text-white">{insights.mostActiveRepository || 'N/A'}</p>
        <p className="mt-2 text-sm text-gray-400">{insights.mostActiveCount} pull requests tracked</p>
      </InsightPanel>

      <InsightPanel title="Highest Merged PR Repo" icon={CheckCircle2}>
        <p className="truncate text-lg font-semibold text-white">{insights.highestMergedRepository || 'N/A'}</p>
        <p className="mt-2 text-sm text-gray-400">{insights.highestMergedCount} merged pull requests</p>
      </InsightPanel>

      <InsightPanel title="Merge Success Rate" icon={Percent}>
        <p className="text-lg font-semibold text-white">{insights.mergeSuccessRate}%</p>
        <p className="mt-2 text-sm text-gray-400">Merged out of resolved pull requests</p>
      </InsightPanel>

      <InsightPanel title="Average PR Comments" icon={MessageCircle}>
        <p className="text-lg font-semibold text-white">{insights.averageComments}</p>
        <p className="mt-2 text-sm text-gray-400">Comments and review comments per PR</p>
      </InsightPanel>
    </div>
  );
}
