import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { fetchGitHubUser } from '../services/githubApi';

export default function OAuthRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const connect = useAuthStore((state) => state.connect);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No authentication token received.');
      return;
    }

    const completeAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to verify authentication token.');
        }

        const user = await response.json();
        const profile = await fetchGitHubUser(user.username);

        connect({
          username: user.username,
          avatarUrl: user.avatarUrl || profile.avatar_url,
          token,
        });

        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err.message || 'Authentication failed.');
      }
    };

    completeAuth();
  }, [searchParams, connect, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-white">
        <div className="glass-panel max-w-md border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-red-300">Authentication Failed</h2>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-primary-600 px-6 py-2 font-semibold transition-colors hover:bg-primary-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-white">
      <Loader2 size={32} className="mb-4 animate-spin text-primary-500" />
      <p>Completing GitHub sign-in...</p>
    </div>
  );
}
