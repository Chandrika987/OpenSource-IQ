import { motion } from 'framer-motion';
import { Book, Star, GitFork, Code } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="glass-panel p-6 flex flex-col gap-4 border-white/5 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color}`} />
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-gray-400 font-medium text-sm">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${color.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

export default function GitHubStats({ profile, repos }) {
  if (!profile || !repos) return null;

  const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
  
  // Calculate top language
  const languages = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topLanguage = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Public Repositories" value={profile.public_repos} icon={Book} color="bg-primary-500" />
      <StatCard title="Total Stars" value={totalStars} icon={Star} color="bg-amber-500" />
      <StatCard title="Total Forks" value={totalForks} icon={GitFork} color="bg-emerald-500" />
      <StatCard title="Top Language" value={topLanguage} icon={Code} color="bg-accent" />
    </div>
  );
}
