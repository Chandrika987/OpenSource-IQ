import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GitHubConnect({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("GitHub user not found");
        if (res.status === 403) throw new Error("GitHub API rate limit exceeded");
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      
      localStorage.setItem('github_username', data.login);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
        setSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-6 pt-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                
              </div>
              <h2 className="text-2xl font-bold text-white text-center">Connect your GitHub Profile</h2>
              <p className="text-gray-400 text-center mt-2 text-sm">
                Enter your GitHub username to fetch your profile and repository statistics.
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  GitHub Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-gray-600"
                  required
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                  Successfully connected! Redirecting...
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success || !username.trim()}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
