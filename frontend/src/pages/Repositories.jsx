import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, RefreshCw } from 'lucide-react';
import RepositoryCard from '../components/repositories/RepositoryCard';
import RepositoryFilters from '../components/repositories/RepositoryFilters';
import RepositoryInsights from '../components/repositories/RepositoryInsights';
import RepositoryStats from '../components/repositories/RepositoryStats';
import SearchBar from '../components/repositories/SearchBar';
import { getRepositories, getRepositoryCacheMeta } from '../services/repositoryService';

const PAGE_SIZE = 12;
const numberFormatter = new Intl.NumberFormat('en');

const sortRepositories = (repositories, sortBy) => {
  const sorted = [...repositories];

  switch (sortBy) {
    case 'stars':
      return sorted.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    case 'forks':
      return sorted.sort((a, b) => b.forks - a.forks || a.name.localeCompare(b.name));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'updated':
    default:
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};

const getRepositoryStats = (repositories) => {
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);
  const languageCounts = repositories.reduce((acc, repo) => {
    if (repo.language !== 'Unknown') {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const mostUsedLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const mostStarredRepository = [...repositories].sort((a, b) => b.stars - a.stars)[0]?.name || 'N/A';

  return {
    totalRepositories: numberFormatter.format(repositories.length),
    totalStars: numberFormatter.format(totalStars),
    totalForks: numberFormatter.format(totalForks),
    mostUsedLanguage,
    mostStarredRepository,
  };
};

const getLanguageBreakdown = (repositories) => {
  const languageCounts = repositories.reduce((acc, repo) => {
    if (repo.language !== 'Unknown') {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
  if (!total) return [];

  return Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Number(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

const RepositorySkeleton = () => (
  <div className="glass-panel min-h-72 animate-pulse border-white/5 p-5">
    <div className="mb-4 h-6 w-2/3 rounded bg-white/10" />
    <div className="mb-2 h-4 w-full rounded bg-white/10" />
    <div className="mb-8 h-4 w-4/5 rounded bg-white/10" />
    <div className="mb-8 flex gap-3">
      <div className="h-5 w-16 rounded bg-white/10" />
      <div className="h-5 w-12 rounded bg-white/10" />
      <div className="h-5 w-12 rounded bg-white/10" />
    </div>
    <div className="mt-auto h-10 rounded bg-white/10" />
  </div>
);

export default function Repositories() {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
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

    const fetchRepositories = async () => {
      if (!username) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getRepositories(username, { signal: controller.signal });
        if (isActive) setRepositories(data);
      } catch (err) {
        if (isActive && err.name !== 'AbortError') {
          setError(err.message || 'Unable to load repositories.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchRepositories();

    if (!username) {
      return () => {
        isActive = false;
        controller.abort();
        refreshController.abort();
      };
    }

    const cacheMeta = getRepositoryCacheMeta(username);
    const delay = cacheMeta?.expiresAt ? Math.max(cacheMeta.expiresAt - Date.now(), 0) : 5 * 60 * 1000;
    const refreshTimer = window.setTimeout(() => {
      getRepositories(username, { forceRefresh: true, signal: refreshController.signal })
        .then((data) => {
          if (isActive) setRepositories(data);
        })
        .catch((err) => {
          if (isActive && err.name !== 'AbortError') setError(err.message || 'Unable to refresh repositories.');
        });
    }, delay);

    return () => {
      isActive = false;
      controller.abort();
      refreshController.abort();
      window.clearTimeout(refreshTimer);
    };
  }, [navigate, username]);

  const languages = useMemo(
    () =>
      [...new Set(repositories.map((repo) => repo.language).filter((language) => language && language !== 'Unknown'))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [repositories]
  );

  const filteredRepositories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = repositories.filter((repo) => {
      const matchesSearch = !query || repo.name.toLowerCase().includes(query);
      const matchesLanguage = selectedLanguage === 'all' || repo.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    });

    return sortRepositories(filtered, sortBy);
  }, [repositories, searchQuery, selectedLanguage, sortBy]);

  const stats = useMemo(() => getRepositoryStats(repositories), [repositories]);
  const topStarred = useMemo(() => sortRepositories(repositories, 'stars').slice(0, 5), [repositories]);
  const recentlyActive = useMemo(() => sortRepositories(repositories, 'updated').slice(0, 5), [repositories]);
  const languageBreakdown = useMemo(() => getLanguageBreakdown(repositories), [repositories]);
  const visibleRepositories = filteredRepositories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRepositories.length;

  const refreshRepositories = async () => {
    if (!username) {
      navigate('/');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const data = await getRepositories(username, { forceRefresh: true });
      setRepositories(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to refresh repositories.');
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/10" />
          </div>
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
            <RepositorySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !repositories.length) {
    return (
      <div className="glass-panel mx-auto mt-12 flex max-w-xl flex-col items-center border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        <AlertCircle size={46} className="mb-4 text-red-400" />
        <h3 className="mb-2 text-xl font-bold">Error Loading Repositories</h3>
        <p className="mb-6 text-sm text-red-200/80">{error}</p>
        <button
          onClick={refreshRepositories}
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Repository Intelligence</h1>
          <p className="mt-2 text-sm text-gray-400">
            Search, compare, and analyze public repositories for {username}.
          </p>
        </div>
        <button
          onClick={refreshRepositories}
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

      {repositories.length ? (
        <>
          <RepositoryStats stats={stats} />
          <RepositoryInsights
            topStarred={topStarred}
            recentlyActive={recentlyActive}
            languageBreakdown={languageBreakdown}
          />

          <div className="grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr]">
            <SearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
            <RepositoryFilters
              languages={languages}
              selectedLanguage={selectedLanguage}
              sortBy={sortBy}
              onLanguageChange={(value) => {
                setSelectedLanguage(value);
                setVisibleCount(PAGE_SIZE);
              }}
              onSortChange={(value) => {
                setSortBy(value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              Showing {visibleRepositories.length} of {filteredRepositories.length} repositories
            </p>
            {(searchQuery || selectedLanguage !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLanguage('all');
                  setVisibleCount(PAGE_SIZE);
                }}
                className="font-medium text-primary-300 transition-colors hover:text-primary-200"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredRepositories.length ? (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleRepositories.map((repository) => (
                  <RepositoryCard key={repository.id} repository={repository} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Load more repositories
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel border-white/5 p-8 text-center">
              <BookOpen size={42} className="mx-auto mb-4 text-primary-400" />
              <h3 className="mb-2 text-xl font-bold">No Matching Repositories</h3>
              <p className="text-sm text-gray-400">Try a different search term or language filter.</p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel border-white/5 p-8 text-center">
          <BookOpen size={42} className="mx-auto mb-4 text-primary-400" />
          <h3 className="mb-2 text-xl font-bold">No Public Repositories</h3>
          <p className="text-sm text-gray-400">This GitHub profile does not have public repositories to analyze.</p>
        </div>
      )}
    </div>
  );
}
