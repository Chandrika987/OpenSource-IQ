import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Crown, Loader2, Medal, RefreshCw, Star, Trophy, Users } from 'lucide-react';
import { getCurrentUserRank, getLeaderboard } from '../services/leaderboardService';
import { useAuthStore } from '../store/authStore';

const rankIcons = {
  1: { icon: Crown, color: 'text-amber-400' },
  2: { icon: Medal, color: 'text-gray-300' },
  3: { icon: Medal, color: 'text-amber-600' },
};

export default function Leaderboard() {
  const { username } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async ({ forceRefresh = false, showRefreshing = false } = {}) => {
    setError(null);
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getLeaderboard({ forceRefresh });
      setLeaderboard(data);
    } catch (err) {
      setError(err.message || 'Unable to load leaderboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const currentUser = getCurrentUserRank(leaderboard, username);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Loader2 size={32} className="mb-4 animate-spin text-primary-500" />
        <p>Loading open source leaderboard...</p>
      </div>
    );
  }

  if (error && !leaderboard.length) {
    return (
      <div className="glass-panel mx-auto mt-12 flex max-w-xl flex-col items-center border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        <AlertCircle size={46} className="mb-4 text-red-400" />
        <h3 className="mb-2 text-xl font-bold">Error Loading Leaderboard</h3>
        <p className="mb-6 text-sm">{error}</p>
        <button
          onClick={() => loadLeaderboard({ forceRefresh: true })}
          className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500/30"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <Trophy size={13} />
            Global Rankings
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Open Source Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-400">
            Ranked by contribution impact — stars, forks, activity, and community reach
          </p>
        </div>
        <button
          onClick={() => loadLeaderboard({ forceRefresh: true, showRefreshing: true })}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {currentUser && (
        <div className="glass-panel border-primary-500/20 bg-primary-500/5 p-5">
          <p className="text-sm text-primary-300">
            You are ranked <strong>#{currentUser.rank}</strong> with a score of{' '}
            <strong>{currentUser.score}</strong> among featured contributors.
          </p>
        </div>
      )}

      {!username && (
        <div className="glass-panel border-white/5 p-5 text-sm text-gray-400">
          <Link to="/" className="text-primary-400 hover:text-primary-300">
            Connect your GitHub
          </Link>{' '}
          to see how you compare on the leaderboard.
        </div>
      )}

      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const rankStyle = rankIcons[entry.rank];
          const RankIcon = rankStyle?.icon || Trophy;
          const isCurrentUser = username?.toLowerCase() === entry.username.toLowerCase();

          return (
            <div
              key={entry.username}
              className={`glass-panel flex items-center gap-4 border-white/5 p-4 transition-colors sm:gap-6 sm:p-5 ${
                isCurrentUser ? 'border-primary-500/30 bg-primary-500/5' : ''
              }`}
            >
              <div className="flex w-10 flex-shrink-0 items-center justify-center">
                {entry.rank <= 3 ? (
                  <RankIcon size={24} className={rankStyle.color} />
                ) : (
                  <span className="text-lg font-bold text-gray-500">#{entry.rank}</span>
                )}
              </div>

              <img
                src={entry.avatarUrl}
                alt={entry.username}
                className="h-12 w-12 flex-shrink-0 rounded-xl border border-white/10 object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={entry.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate font-semibold text-white hover:text-primary-300"
                  >
                    {entry.name}
                  </a>
                  <span className="text-sm text-gray-500">@{entry.username}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} />
                    {entry.totalStars.toLocaleString()} stars
                  </span>
                  <span>{entry.publicRepos} repos</span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} />
                    {entry.followers.toLocaleString()} followers
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-bold text-gradient">{entry.score}</p>
                <p className="text-xs text-gray-500">IQ Score</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
