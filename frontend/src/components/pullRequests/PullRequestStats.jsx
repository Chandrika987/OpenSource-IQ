import { CheckCircle2, GitPullRequest, Percent, XCircle } from 'lucide-react';

const StatItem = ({ icon: Icon, label, value, accent }) => (
  <div className="glass-panel min-h-32 border-white/5 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="mt-3 truncate text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-xl border border-white/10 bg-white/5 p-3 ${accent}`}>
        <Icon size={21} />
      </div>
    </div>
  </div>
);

export default function PullRequestStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <StatItem icon={GitPullRequest} label="Total Pull Requests" value={stats.total} accent="text-primary-400" />
      <StatItem icon={GitPullRequest} label="Open Pull Requests" value={stats.open} accent="text-emerald-400" />
      <StatItem icon={XCircle} label="Closed Pull Requests" value={stats.closed} accent="text-rose-400" />
      <StatItem icon={CheckCircle2} label="Merged Pull Requests" value={stats.merged} accent="text-violet-400" />
      <StatItem icon={Percent} label="Merge Success Rate" value={`${stats.mergeSuccessRate}%`} accent="text-amber-400" />
    </div>
  );
}
