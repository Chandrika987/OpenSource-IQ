import { AlertCircle, Archive, CheckCircle2, FolderKanban, Gauge } from 'lucide-react';

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

export default function IssueStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <StatItem icon={Archive} label="Total Issues" value={stats.totalIssues} accent="text-primary-400" />
      <StatItem icon={AlertCircle} label="Open Issues" value={stats.openIssues} accent="text-emerald-400" />
      <StatItem icon={CheckCircle2} label="Closed Issues" value={stats.closedIssues} accent="text-violet-400" />
      <StatItem icon={FolderKanban} label="Repos With Issues" value={stats.repositoriesWithIssues} accent="text-cyan-400" />
      <StatItem icon={Gauge} label="Most Active Repo" value={stats.mostActiveRepository} accent="text-amber-400" />
    </div>
  );
}
