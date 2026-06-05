import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Brain,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import GitHubProfile from '../components/github/GitHubProfile';
import { getGitHubAnalytics } from '../services/githubAnalyticsService';
import { generatePortfolioInsights } from '../services/portfolioInsights';
import { useAuthStore } from '../store/authStore';

const insightStyles = {
  strength: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
  growth: 'border-primary-500/20 bg-primary-500/5 text-primary-300',
  focus: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300',
  opportunity: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
};

export default function Profile() {
  const navigate = useNavigate();
  const { username, signOut } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(
    async ({ forceRefresh = false, showRefreshing = false } = {}) => {
      if (!username) {
        navigate('/');
        return;
      }

      setError(null);
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await getGitHubAnalytics(username, { forceRefresh });
        setAnalytics(data);
      } catch (err) {
        setError(err.message || 'Unable to load profile data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate, username]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleDisconnect = () => {
    signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Loader2 size={32} className="mb-4 animate-spin text-primary-500" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="glass-panel mx-auto mt-12 flex max-w-xl flex-col items-center border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        <AlertCircle size={46} className="mb-4 text-red-400" />
        <h3 className="mb-2 text-xl font-bold">Error Loading Profile</h3>
        <p className="mb-6 text-sm">{error}</p>
        <button
          onClick={() => loadProfile({ forceRefresh: true })}
          className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500/30"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const insights = generatePortfolioInsights(analytics);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <UserBadge />
            Your Developer Profile
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile & Portfolio Review</h1>
          <p className="mt-2 text-sm text-gray-400">
            AI-powered insights based on your public GitHub activity
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadProfile({ forceRefresh: true, showRefreshing: true })}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleDisconnect}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
          >
            Disconnect
          </button>
        </div>
      </div>

      <GitHubProfile profile={analytics.profile} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <ScoreCard
          icon={Award}
          label="Consistency Score"
          value={`${insights.consistencyScore}/100`}
          accent="text-amber-400"
        />
        <ScoreCard
          icon={Target}
          label="Activity Level"
          value={insights.activityLevel.charAt(0).toUpperCase() + insights.activityLevel.slice(1)}
          accent="text-emerald-400"
        />
        <ScoreCard
          icon={Sparkles}
          label="Avg Stars / Repo"
          value={insights.avgStars.toLocaleString()}
          accent="text-primary-400"
        />
      </div>

      <div className="glass-panel border-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Brain size={20} className="text-accent" />
          <h3 className="text-lg font-semibold">Portfolio Summary</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{insights.summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel border-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold">Key Insights</h3>
          <div className="space-y-3">
            {insights.insights.map((insight) => (
              <div
                key={insight.title}
                className={`rounded-xl border p-4 ${insightStyles[insight.type] || insightStyles.growth}`}
              >
                <h4 className="mb-1 font-semibold">{insight.title}</h4>
                <p className="text-sm opacity-90">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel border-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold">Recommendations</h3>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-300">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-primary-300">
                  {index + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-panel border-white/5 p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href={analytics.profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={16} />
            View on GitHub
          </a>
          <a
            href={`https://github.com/${analytics.profile.login}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={16} />
            All Repositories
          </a>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="glass-panel border-white/5 p-6">
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
        <Icon size={16} className={accent} />
        {label}
      </div>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function UserBadge() {
  return <span className="h-2 w-2 rounded-full bg-accent" />;
}
