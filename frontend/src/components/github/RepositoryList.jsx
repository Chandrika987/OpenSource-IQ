import { Star, GitFork, BookOpen, ExternalLink, Circle } from 'lucide-react';

export default function RepositoryList({ repos }) {
  if (!repos || repos.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-gray-400 border-white/5">
        No public repositories found.
      </div>
    );
  }

  // Sort by recently updated
  const sortedRepos = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const recentRepos = sortedRepos.slice(0, 6);

  return (
    <div className="glass-panel p-6 border-white/5 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen size={20} className="text-primary-400" />
          Recently Updated Repositories
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentRepos.map(repo => (
          <div key={repo.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/30 hover:bg-white/10 transition-all flex flex-col justify-between h-full group">
            <div>
              <div className="flex justify-between items-start mb-2">
                <a 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1 truncate block pr-4"
                >
                  {repo.name}
                </a>
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white shrink-0 mt-0.5">
                  <ExternalLink size={14} />
                </a>
              </div>
              {repo.description && (
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">
                  {repo.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-2">
              {repo.language && (
                <div className="flex items-center gap-1.5">
                  <Circle size={10} className="text-primary-400 fill-primary-400" />
                  <span>{repo.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Star size={14} />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork size={14} />
                <span>{repo.forks_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
