import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GitHubProfile from '../components/github/GitHubProfile';
import GitHubStats from '../components/github/GitHubStats';
import RepositoryList from '../components/github/RepositoryList';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('github_username');
    if (!username) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
        ]);

        if (!profileRes.ok || !reposRes.ok) {
          if (profileRes.status === 403 || reposRes.status === 403) {
            throw new Error("GitHub API rate limit exceeded. Please try again later.");
          }
          throw new Error("Failed to fetch data from GitHub.");
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();

        setProfile(profileData);
        setRepos(reposData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white h-[50vh]">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p>Loading GitHub Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel border-red-500/20 bg-red-500/5 p-8 text-center text-red-400 max-w-lg mx-auto mt-12 flex flex-col items-center rounded-2xl">
        <AlertCircle size={48} className="mb-4 text-red-500" />
        <h3 className="text-xl font-bold mb-2 text-red-300">Error Loading Data</h3>
        <p className="mb-6">{error}</p>
        <button 
          onClick={() => { localStorage.removeItem('github_username'); navigate('/'); }}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors border border-red-500/50"
        >
          Disconnect and Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GitHubProfile profile={profile} />
        <GitHubStats profile={profile} repos={repos} />
        <RepositoryList repos={repos} />
      </motion.div>
    </div>
  );
}
