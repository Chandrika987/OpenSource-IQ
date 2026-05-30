import { BookOpen, Code2, GitFork, Star, Trophy } from 'lucide-react';

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

export default function RepositoryStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <StatItem icon={BookOpen} label="Total Repositories" value={stats.totalRepositories} accent="text-primary-400" />
      <StatItem icon={Star} label="Total Stars" value={stats.totalStars} accent="text-amber-400" />
      <StatItem icon={GitFork} label="Total Forks" value={stats.totalForks} accent="text-emerald-400" />
      <StatItem icon={Code2} label="Most Used Language" value={stats.mostUsedLanguage} accent="text-cyan-400" />
      <StatItem icon={Trophy} label="Most Starred" value={stats.mostStarredRepository} accent="text-violet-400" />
    </div>
  );
}
