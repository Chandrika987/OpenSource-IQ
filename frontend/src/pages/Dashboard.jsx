import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GitHubProfile from '../components/github/GitHubProfile';
import GitHubStats from '../components/github/GitHubStats';
import RepositoryList from '../components/github/RepositoryList';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { fetchGitHubRepos, fetchGitHubUser } from '../services/githubApi';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { username, signOut } = useAuthStore();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, reposData] = await Promise.all([
          fetchGitHubUser(username),
          fetchGitHubRepos(username)
        ]);

        setProfile(profileData);
        setRepos(reposData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, username]);

  const handleDisconnect = async () => {
    await signOut();
    navigate('/');
  };

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
          onClick={handleDisconnect}
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
