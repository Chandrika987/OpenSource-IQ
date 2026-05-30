import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Archive, RefreshCw } from 'lucide-react';
import IssueCard from '../components/issues/IssueCard';
import IssueCharts from '../components/issues/IssueCharts';
import IssueFilters from '../components/issues/IssueFilters';
import IssueInsights from '../components/issues/IssueInsights';
import IssueSearchBar from '../components/issues/IssueSearchBar';
import IssueStats from '../components/issues/IssueStats';
import { getIssueCacheMeta, getIssues } from '../services/issueService';

const PAGE_SIZE = 12;
const numberFormatter = new Intl.NumberFormat('en');

const sortIssues = (issues, sortBy) => {
  const sorted = [...issues];

  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'comments':
      return sorted.sort((a, b) => b.comments - a.comments || new Date(b.updatedAt) - new Date(a.updatedAt));
    case 'updated':
    default:
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};

const getRepositoryCounts = (issues) => {
  const counts = issues.reduce((acc, issue) => {
    if (!acc[issue.repositoryName]) {
      acc[issue.repositoryName] = { repository: issue.repositoryName, count: 0, open: 0, closed: 0 };
    }

    acc[issue.repositoryName].count += 1;
    acc[issue.repositoryName][issue.state] += 1;
    return acc;
  }, {});

  return Object.values(counts).sort((a, b) => b.count - a.count);
};

const getStats = (issues) => {
  const openIssues = issues.filter((issue) => issue.state === 'open').length;
  const closedIssues = issues.filter((issue) => issue.state === 'closed').length;
  const repositoryCounts = getRepositoryCounts(issues);

  return {
    totalIssues: numberFormatter.format(issues.length),
    openIssues: numberFormatter.format(openIssues),
    closedIssues: numberFormatter.format(closedIssues),
    repositoriesWithIssues: numberFormatter.format(repositoryCounts.length),
    mostActiveRepository: repositoryCounts[0]?.repository || 'N/A',
  };
};

const getDistribution = (issues) => {
  const repositoryCounts = getRepositoryCounts(issues);
  const total = issues.length;

  if (!total) return [];

  return repositoryCounts.map((repo) => ({
    ...repo,
    percentage: Number(((repo.count / total) * 100).toFixed(1)),
  }));
};

const IssueSkeleton = () => (
  <div className="glass-panel min-h-72 animate-pulse border-white/5 p-5">
    <div className="mb-4 flex gap-2">
      <div className="h-6 w-16 rounded bg-white/10" />
      <div className="h-6 w-12 rounded bg-white/10" />
    </div>
    <div className="mb-3 h-6 w-5/6 rounded bg-white/10" />
    <div className="mb-8 h-4 w-1/2 rounded bg-white/10" />
    <div className="mb-8 flex gap-2">
      <div className="h-6 w-20 rounded-full bg-white/10" />
      <div className="h-6 w-24 rounded-full bg-white/10" />
    </div>
    <div className="h-12 rounded bg-white/10" />
  </div>
);

export default function Issues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedRepository, setSelectedRepository] = useState('all');
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const username = useMemo(() => localStorage.getItem('github_username'), []);

  useEffect(() => {
    const controller = new AbortController();
    const refreshController = new AbortController();
    let isActive = true;

    const fetchIssues = async () => {
      if (!username) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getIssues(username, { signal: controller.signal });
        if (isActive) setIssues(data);
      } catch (err) {
        if (isActive && err.name !== 'AbortError') {
          setError(err.message || 'Unable to load issues.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchIssues();

    if (!username) {
      return () => {
        isActive = false;
        controller.abort();
        refreshController.abort();
      };
    }

    const cacheMeta = getIssueCacheMeta(username);
    const delay = cacheMeta?.expiresAt ? Math.max(cacheMeta.expiresAt - Date.now(), 0) : 5 * 60 * 1000;
    const refreshTimer = window.setTimeout(() => {
      getIssues(username, { forceRefresh: true, signal: refreshController.signal })
        .then((data) => {
          if (isActive) setIssues(data);
        })
        .catch((err) => {
          if (isActive && err.name !== 'AbortError') setError(err.message || 'Unable to refresh issues.');
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
    () => [...new Set(issues.map((issue) => issue.repositoryName))].sort((a, b) => a.localeCompare(b)),
    [issues]
  );

  const labels = useMemo(
    () =>
      [...new Set(issues.flatMap((issue) => issue.labels.map((label) => label.name)))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [issues]
  );

  const filteredIssues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = issues.filter((issue) => {
      const matchesStatus = status === 'all' || issue.state === status;
      const matchesRepository = selectedRepository === 'all' || issue.repositoryName === selectedRepository;
      const matchesLabel = selectedLabel === 'all' || issue.labels.some((label) => label.name === selectedLabel);
      const matchesSearch =
        !query ||
        issue.title.toLowerCase().includes(query) ||
        issue.repositoryName.toLowerCase().includes(query);

      return matchesStatus && matchesRepository && matchesLabel && matchesSearch;
    });

    return sortIssues(filtered, sortBy);
  }, [issues, searchQuery, selectedLabel, selectedRepository, sortBy, status]);

  const stats = useMemo(() => getStats(issues), [issues]);
  const distribution = useMemo(() => getDistribution(issues), [issues]);
  const statusChartData = useMemo(
    () => [
      { name: 'Open', value: issues.filter((issue) => issue.state === 'open').length, color: '#10b981' },
      { name: 'Closed', value: issues.filter((issue) => issue.state === 'closed').length, color: '#8b5cf6' },
    ],
    [issues]
  );
  const repositoryChartData = useMemo(
    () => distribution.slice(0, 10).map((repo) => ({ repository: repo.repository, count: repo.count })),
    [distribution]
  );
  const highestOpenRepositories = useMemo(
    () => distribution.filter((repo) => repo.open > 0).sort((a, b) => b.open - a.open).slice(0, 5),
    [distribution]
  );
  const visibleIssues = filteredIssues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredIssues.length;

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const refreshIssues = async () => {
    if (!username) {
      navigate('/');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const data = await getIssues(username, { forceRefresh: true });
      setIssues(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to refresh issues.');
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
          <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="glass-panel min-h-32 animate-pulse border-white/5 p-5">
              <div className="mb-6 h-4 w-24 rounded bg-white/10" />
              <div className="h-7 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <IssueSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !issues.length) {
    return (
      <div className="glass-panel mx-auto mt-12 flex max-w-xl flex-col items-center border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        <AlertCircle size={46} className="mb-4 text-red-400" />
        <h3 className="mb-2 text-xl font-bold">Error Loading Issues</h3>
        <p className="mb-6 text-sm text-red-200/80">{error}</p>
        <button
          onClick={refreshIssues}
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Issues Intelligence</h1>
          <p className="mt-2 text-sm text-gray-400">
            Analyze issue activity across public repositories for {username}.
          </p>
        </div>
        <button
          onClick={refreshIssues}
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

      {issues.length ? (
        <>
          <IssueStats stats={stats} />
          <IssueInsights
            mostActiveRepository={distribution[0]}
            highestOpenRepositories={highestOpenRepositories}
            distribution={distribution}
          />
          <IssueCharts statusData={statusChartData} repositoryData={repositoryChartData} />

          <div className="grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr]">
            <IssueSearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                resetPaging();
              }}
            />
            <IssueFilters
              status={status}
              repositories={repositories}
              labels={labels}
              selectedRepository={selectedRepository}
              selectedLabel={selectedLabel}
              sortBy={sortBy}
              onStatusChange={(value) => {
                setStatus(value);
                resetPaging();
              }}
              onRepositoryChange={(value) => {
                setSelectedRepository(value);
                resetPaging();
              }}
              onLabelChange={(value) => {
                setSelectedLabel(value);
                resetPaging();
              }}
              onSortChange={(value) => {
                setSortBy(value);
                resetPaging();
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              Showing {visibleIssues.length} of {filteredIssues.length} issues
            </p>
            {(searchQuery || status !== 'all' || selectedRepository !== 'all' || selectedLabel !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatus('all');
                  setSelectedRepository('all');
                  setSelectedLabel('all');
                  resetPaging();
                }}
                className="font-medium text-primary-300 transition-colors hover:text-primary-200"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredIssues.length ? (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Load more issues
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel border-white/5 p-8 text-center">
              <Archive size={42} className="mx-auto mb-4 text-primary-400" />
              <h3 className="mb-2 text-xl font-bold">No Matching Issues</h3>
              <p className="text-sm text-gray-400">Try a different search term, status, repository, or label filter.</p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel border-white/5 p-8 text-center">
          <Archive size={42} className="mx-auto mb-4 text-primary-400" />
          <h3 className="mb-2 text-xl font-bold">No Issues Found</h3>
          <p className="text-sm text-gray-400">No public repository issues were found for this GitHub profile.</p>
        </div>
      )}
    </div>
  );
}
