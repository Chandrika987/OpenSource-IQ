import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, GitFork, Radio, RefreshCw, Star, UserPlus, Users } from 'lucide-react';
import AnalyticsCard from '../components/analytics/AnalyticsCard';
import LanguageDistributionChart from '../components/analytics/LanguageDistributionChart';
import RepositoryActivityChart from '../components/analytics/RepositoryActivityChart';
import StarsPerRepositoryChart from '../components/analytics/StarsPerRepositoryChart';
import { getGitHubAnalytics, getGitHubAnalyticsCacheMeta } from '../services/githubAnalyticsService';

const numberFormatter = new Intl.NumberFormat('en');

const SkeletonCard = () => (
  <div className="glass-panel min-h-36 animate-pulse border-white/5 p-6">
    <div className="mb-6 h-4 w-32 rounded bg-white/10" />
    <div className="h-9 w-20 rounded bg-white/10" />
    <div className="mt-6 h-3 w-28 rounded bg-white/10" />
  </div>
);

const SkeletonChart = () => (
  <div className="glass-panel min-h-96 animate-pulse border-white/5 p-6">
    <div className="mb-8 h-5 w-48 rounded bg-white/10" />
    <div className="h-72 rounded-xl bg-white/5" />
  </div>
);

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const manualRefreshController = useRef(null);

  const username = useMemo(() => localStorage.getItem('github_username'), []);

  const loadAnalytics = useCallback(async ({ forceRefresh = false, showRefreshing = false } = {}) => {
    if (!username) {
      navigate('/');
      return;
    }

    manualRefreshController.current?.abort();
    manualRefreshController.current = new AbortController();

    setError(null);
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getGitHubAnalytics(username, {
        signal: manualRefreshController.current.signal,
        forceRefresh,
      });
      setAnalytics(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load GitHub analytics.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, username]);

  useEffect(() => {
    const initialController = new AbortController();
    const refreshController = new AbortController();
    let isActive = true;

    const fetchAnalytics = async () => {
      if (!username) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getGitHubAnalytics(username, { signal: initialController.signal });
        if (isActive) setAnalytics(data);
      } catch (err) {
        if (isActive && err.name !== 'AbortError') {
          setError(err.message || 'Unable to load GitHub analytics.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchAnalytics();

    const cacheMeta = username ? getGitHubAnalyticsCacheMeta(username) : null;
    const delay = cacheMeta?.expiresAt ? Math.max(cacheMeta.expiresAt - Date.now(), 0) : 5 * 60 * 1000;
    const refreshTimer = window.setTimeout(() => {
      getGitHubAnalytics(username, { forceRefresh: true, signal: refreshController.signal })
        .then((data) => {
          if (isActive) setAnalytics(data);
        })
        .catch((err) => {
          if (isActive && err.name !== 'AbortError') setError(err.message || 'Unable to refresh GitHub analytics.');
        });
    }, delay);

    return () => {
      isActive = false;
      initialController.abort();
      refreshController.abort();
      manualRefreshController.current?.abort();
      window.clearTimeout(refreshTimer);
    };
  }, [navigate, username]);

  const cards = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: 'Public Repositories',
        value: numberFormatter.format(analytics.metrics.publicRepositories),
        icon: BookOpen,
        accent: 'text-primary-400',
      },
      {
        title: 'Followers',
        value: numberFormatter.format(analytics.metrics.followers),
        icon: Users,
        accent: 'text-emerald-400',
      },
      {
        title: 'Following',
        value: numberFormatter.format(analytics.metrics.following),
        icon: UserPlus,
        accent: 'text-cyan-400',
      },
      {
        title: 'Total Stars',
        value: numberFormatter.format(analytics.metrics.totalStars),
        icon: Star,
        accent: 'text-amber-400',
      },
      {
        title: 'Total Forks',
        value: numberFormatter.format(analytics.metrics.totalForks),
        icon: GitFork,
        accent: 'text-violet-400',
      },
      {
        title: 'Total Open Issues',
        value: numberFormatter.format(analytics.metrics.totalOpenIssues),
        icon: AlertCircle,
        accent: 'text-rose-400',
      },
    ];
  }, [analytics]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
          <div className="xl:col-span-2">
            <SkeletonChart />
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="glass-panel mx-auto mt-12 flex max-w-xl flex-col items-center border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        <AlertCircle size={46} className="mb-4 text-red-400" />
        <h3 className="mb-2 text-xl font-bold">Error Loading Analytics</h3>
        <p className="mb-6 text-sm text-red-200/80">{error}</p>
        <button
          onClick={() => loadAnalytics({ forceRefresh: true })}
          className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500/30"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!analytics?.repositories?.length) {
    return (
      <div className="glass-panel mx-auto mt-12 max-w-xl border-white/5 p-8 text-center">
        <BookOpen size={42} className="mx-auto mb-4 text-primary-400" />
        <h3 className="mb-2 text-xl font-bold">No Public Repositories</h3>
        <p className="text-sm text-gray-400">Analytics will appear here after this GitHub profile has public repositories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Radio size={13} />
            Live GitHub REST API
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics for {analytics.profile.login}</h1>
          <p className="mt-2 text-sm text-gray-400">
            Last updated {new Date(analytics.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={() => loadAnalytics({ forceRefresh: true, showRefreshing: true })}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AnalyticsCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LanguageDistributionChart data={analytics.charts.languageDistribution} />
        <StarsPerRepositoryChart data={analytics.charts.topStarredRepositories} />
        <div className="xl:col-span-2">
          <RepositoryActivityChart data={analytics.charts.repositoryActivity} />
        </div>
      </div>
    </div>
  );
}
