const GITHUB_API_BASE_URL = 'https://api.github.com';
const CACHE_DURATION_MS = 5 * 60 * 1000;
const inFlightRequests = new Map();

const getCacheKey = (username) => `github_repositories_${username.toLowerCase()}`;

const readCache = (username) => {
  try {
    const cached = localStorage.getItem(getCacheKey(username));
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null;

    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(getCacheKey(username));
      return null;
    }

    return parsed.data;
  } catch {
    localStorage.removeItem(getCacheKey(username));
    return null;
  }
};

const writeCache = (username, data) => {
  localStorage.setItem(
    getCacheKey(username),
    JSON.stringify({
      timestamp: Date.now(),
      data,
    })
  );
};

const getRateLimitMessage = (response) => {
  const reset = response.headers.get('x-ratelimit-reset');
  if (!reset) return 'GitHub API rate limit exceeded. Please try again later.';

  const resetTime = new Date(Number(reset) * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `GitHub API rate limit exceeded. Please try again after ${resetTime}.`;
};

const requestJson = async (url, signal) => {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (response.status === 403 || response.status === 429) {
    throw new Error(getRateLimitMessage(response));
  }

  if (response.status === 404) {
    throw new Error('GitHub user not found.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch repositories from GitHub.');
  }

  return response.json();
};

const normalizeRepository = (repo) => ({
  id: repo.id,
  name: repo.name,
  fullName: repo.full_name,
  description: repo.description,
  language: repo.language || 'Unknown',
  stars: repo.stargazers_count || 0,
  forks: repo.forks_count || 0,
  openIssues: repo.open_issues_count || 0,
  visibility: repo.visibility || (repo.private ? 'private' : 'public'),
  isFork: repo.fork,
  createdAt: repo.created_at,
  updatedAt: repo.updated_at,
  pushedAt: repo.pushed_at,
  url: repo.html_url,
  homepage: repo.homepage,
  topics: repo.topics || [],
});

const fetchAllRepositoryPages = async (username, signal) => {
  const repositories = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const pageData = await requestJson(
      `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      signal
    );

    repositories.push(...pageData);
    hasMore = pageData.length === 100;
    page += 1;
  }

  return repositories.map(normalizeRepository);
};

export const getRepositories = async (username, { signal, forceRefresh = false } = {}) => {
  if (!username?.trim()) {
    throw new Error('GitHub username is required.');
  }

  const normalizedUsername = username.trim();

  if (!forceRefresh) {
    const cached = readCache(normalizedUsername);
    if (cached) return cached;
  }

  const requestKey = getCacheKey(normalizedUsername);
  if (inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey);
  }

  const request = fetchAllRepositoryPages(normalizedUsername, signal)
    .then((repositories) => {
      writeCache(normalizedUsername, repositories);
      return repositories;
    })
    .finally(() => {
      inFlightRequests.delete(requestKey);
    });

  inFlightRequests.set(requestKey, request);
  return request;
};

export const getRepositoryCacheMeta = (username) => {
  try {
    const cached = localStorage.getItem(getCacheKey(username));
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed?.timestamp) return null;

    return {
      timestamp: parsed.timestamp,
      expiresAt: parsed.timestamp + CACHE_DURATION_MS,
      isExpired: Date.now() >= parsed.timestamp + CACHE_DURATION_MS,
    };
  } catch {
    return null;
  }
};
