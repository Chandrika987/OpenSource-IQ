import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, GitPullRequest, RefreshCw } from 'lucide-react';
import PullRequestCard from '../components/pullRequests/PullRequestCard';
import PullRequestCharts from '../components/pullRequests/PullRequestCharts';
import PullRequestFilters from '../components/pullRequests/PullRequestFilters';
import PullRequestInsights from '../components/pullRequests/PullRequestInsights';
import PullRequestStats from '../components/pullRequests/PullRequestStats';
import { getPullRequestCacheMeta, getPullRequests } from '../services/pullRequestService';

const PAGE_SIZE = 12;
const numberFormatter = new Intl.NumberFormat('en');

const getRepositoryCounts = (pullRequests) => {
  const counts = pullRequests.reduce((acc, pullRequest) => {
    if (!acc[pullRequest.repositoryName]) {
      acc[pullRequest.repositoryName] = {
        repository: pullRequest.repositoryName,
        count: 0,
        open: 0,
        closed: 0,
        merged: 0,
      };
    }

    acc[pullRequest.repositoryName].count += 1;
    acc[pullRequest.repositoryName][pullRequest.status] += 1;
    return acc;
  }, {});

  return Object.values(counts).sort((a, b) => b.count - a.count);
};

const getStats = (pullRequests) => {
  const open = pullRequests.filter((pullRequest) => pullRequest.status === 'open').length;
  const merged = pullRequests.filter((pullRequest) => pullRequest.status === 'merged').length;
  const closed = pullRequests.filter((pullRequest) => pullRequest.status === 'closed').length;
  const resolved = merged + closed;

  return {
    total: numberFormatter.format(pullRequests.length),
    open: numberFormatter.format(open),
    closed: numberFormatter.format(closed),
    merged: numberFormatter.format(merged),
    mergeSuccessRate: resolved ? Math.round((merged / resolved) * 100) : 0,
    raw: { open, closed, merged, resolved },
  };
};

const sortPullRequests = (pullRequests, sortBy) => {
  const sorted = [...pullRequests];

  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'comments':
      return sorted.sort((a, b) => b.comments - a.comments || new Date(b.updatedAt) - new Date(a.updatedAt));
    case 'recent':
    default:
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};

const PullRequestSkeleton = () => (
  <div className="glass-panel min-h-72 animate-pulse border-white/5 p-5">
    <div className="mb-4 flex gap-2">
      <div className="h-6 w-16 rounded bg-white/10" />
      <div className="h-6 w-12 rounded bg-white/10" />
    </div>
    <div className="mb-3 h-6 w-5/6 rounded bg-white/10" />
    <div className="mb-20 h-4 w-1/2 rounded bg-white/10" />
    <div className="h-16 rounded bg-white/10" />
  </div>
);

const ChartSkeleton = () => (
  <div className="glass-panel min-h-96 animate-pulse border-white/5 p-6">
    <div className="mb-8 h-5 w-48 rounded bg-white/10" />
    <div className="h-72 rounded-xl bg-white/5" />
  </div>
);

export default function PullRequests() {
  const navigate = useNavigate();
  const [pullRequests, setPullRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedRepository, setSelectedRepository] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const username = useMemo(() => localStorage.getItem('github_username'), []);

  useEffect(() => {
    const controller = new AbortController();
    const refreshController = new AbortController();
    let isActive = true;

    const fetchPullRequests = async () => {
      if (!username) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getPullRequests(username, { signal: controller.signal });
        if (isActive) setPullRequests(data);
      } catch (err) {
        if (isActive && err.name !== 'AbortError') {
          setError(err.message || 'Unable to load pull requests.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchPullRequests();

    if (!username) {
      return () => {
        isActive = false;
        controller.abort();
        refreshController.abort();
      };
    }

    const cacheMeta = getPullRequestCacheMeta(username);
    const delay = cacheMeta?.expiresAt ? Math.max(cacheMeta.expiresAt - Date.now(), 0) : 10 * 60 * 1000;
    const refreshTimer = window.setTimeout(() => {
      getPullRequests(username, { forceRefresh: true, signal: refreshController.signal })
        .then((data) => {
          if (isActive) setPullRequests(data);
        })
        .catch((err) => {
          if (isActive && err.name !== 'AbortError') setError(err.message || 'Unable to refresh pull requests.');
        });
    }, delay);

    return () => {
      isActive = false;
      controller.abort();
      refreshController.abort();
      window.clearTimeout(refreshTimer);
    };
  }, [navigate, username]);

  const repositories = useMemo(
    () => [...new Set(pullRequests.map((pullRequest) => pullRequest.repositoryName))].sort((a, b) => a.localeCompare(b)),
    [pullRequests]
  );

  const filteredPullRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = pullRequests.filter((pullRequest) => {
      const matchesStatus = status === 'all' || pullRequest.status === status;
      const matchesRepository = selectedRepository === 'all' || pullRequest.repositoryName === selectedRepository;
      const matchesSearch =
        !query ||
        pullRequest.title.toLowerCase().includes(query) ||
        pullRequest.repositoryName.toLowerCase().includes(query);

      return matchesStatus && matchesRepository && matchesSearch;
    });

    return sortPullRequests(filtered, sortBy);
  }, [pullRequests, searchQuery, selectedRepository, sortBy, status]);

  const stats = useMemo(() => getStats(pullRequests), [pullRequests]);
  const repositoryCounts = useMemo(() => getRepositoryCounts(pullRequests), [pullRequests]);
  const statusChartData = useMemo(
    () => [
      { name: 'Open', value: stats.raw.open, color: '#10b981' },
      { name: 'Closed', value: stats.raw.closed, color: '#ef4444' },
      { name: 'Merged', value: stats.raw.merged, color: '#8b5cf6' },
    ],
    [stats]
  );
  const repositoryChartData = useMemo(
    () => repositoryCounts.slice(0, 10).map((repo) => ({ repository: repo.repository, count: repo.count })),
    [repositoryCounts]
  );
  const insights = useMemo(() => {
    const highestMerged = [...repositoryCounts].sort((a, b) => b.merged - a.merged)[0];
    const averageComments = pullRequests.length
      ? (pullRequests.reduce((sum, pullRequest) => sum + pullRequest.comments, 0) / pullRequests.length).toFixed(1)
      : '0.0';

    return {
      mostActiveRepository: repositoryCounts[0]?.repository,
      mostActiveCount: repositoryCounts[0]?.count || 0,
      highestMergedRepository: highestMerged?.merged ? highestMerged.repository : null,
      highestMergedCount: highestMerged?.merged || 0,
      mergeSuccessRate: stats.mergeSuccessRate,
      averageComments,
    };
  }, [pullRequests, repositoryCounts, stats.mergeSuccessRate]);

  const visiblePullRequests = filteredPullRequests.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPullRequests.length;
  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const refreshPullRequests = async () => {
    if (!username) {
      navigate('/');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const data = await getPullRequests(username, { forceRefresh: true });
      setPullRequests(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to refresh pull requests.');
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="glass-panel min-h-32 animate-pulse border-white/5 p-5">
              <div className="mb-6 h-4 w-28 rounded bg-white/10" />
              <div className="h-7 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <PullRequestSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !pullRequests.length) {
    return (
      <div className="glass-panel mx-auto mt-12 flex max-w-xl flex-col items-center border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        <AlertCircle size={46} className="mb-4 text-red-400" />
        <h3 className="mb-2 text-xl font-bold">Error Loading Pull Requests</h3>
        <p className="mb-6 text-sm text-red-200/80">{error}</p>
        <button
          onClick={refreshPullRequests}
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pull Request Intelligence</h1>
          <p className="mt-2 text-sm text-gray-400">
            Track pull request activity and collaboration across public repositories for {username}.
          </p>
        </div>
        <button
          onClick={refreshPullRequests}
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

      {pullRequests.length ? (
        <>
          <PullRequestStats stats={stats} />
          <PullRequestInsights insights={insights} />
          <PullRequestCharts statusData={statusChartData} repositoryData={repositoryChartData} />

          <PullRequestFilters
            searchQuery={searchQuery}
            status={status}
            repositories={repositories}
            selectedRepository={selectedRepository}
            sortBy={sortBy}
            onSearchChange={(value) => {
              setSearchQuery(value);
              resetPaging();
            }}
            onStatusChange={(value) => {
              setStatus(value);
              resetPaging();
            }}
            onRepositoryChange={(value) => {
              setSelectedRepository(value);
              resetPaging();
            }}
            onSortChange={(value) => {
              setSortBy(value);
              resetPaging();
            }}
          />

          <div className="flex items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              Showing {visiblePullRequests.length} of {filteredPullRequests.length} pull requests
            </p>
            {(searchQuery || status !== 'all' || selectedRepository !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatus('all');
                  setSelectedRepository('all');
                  resetPaging();
                }}
                className="font-medium text-primary-300 transition-colors hover:text-primary-200"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredPullRequests.length ? (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {visiblePullRequests.map((pullRequest) => (
                  <PullRequestCard key={pullRequest.id} pullRequest={pullRequest} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Load more pull requests
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel border-white/5 p-8 text-center">
              <GitPullRequest size={42} className="mx-auto mb-4 text-primary-400" />
              <h3 className="mb-2 text-xl font-bold">No Matching Pull Requests</h3>
              <p className="text-sm text-gray-400">Try a different search, status, repository, or sort option.</p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel border-white/5 p-8 text-center">
          <GitPullRequest size={42} className="mx-auto mb-4 text-primary-400" />
          <h3 className="mb-2 text-xl font-bold">No Pull Requests Found</h3>
          <p className="text-sm text-gray-400">No pull requests were found across this user's public repositories.</p>
        </div>
      )}
    </div>
  );
}
