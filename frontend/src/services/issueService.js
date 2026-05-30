const GITHUB_API_BASE_URL = 'https://api.github.com';
const CACHE_DURATION_MS = 5 * 60 * 1000;
const inFlightRequests = new Map();

const getCacheKey = (username) => `github_issues_${username.toLowerCase()}`;

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
    throw new Error('GitHub user or repository not found.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub issues.');
  }

  return response.json();
};

const fetchAllRepositories = async (username, signal) => {
  const repositories = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await requestJson(
      `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      signal
    );

    repositories.push(...data);
    hasMore = data.length === 100;
    page += 1;
  }

  return repositories;
};

const fetchRepositoryIssues = async (repository, signal) => {
  const issues = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await requestJson(
      `${GITHUB_API_BASE_URL}/repos/${repository.full_name}/issues?state=all&per_page=100&page=${page}&sort=updated&direction=desc`,
      signal
    );

    issues.push(...data);
    hasMore = data.length === 100;
    page += 1;
  }

  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      id: issue.id,
      title: issue.title,
      number: issue.number,
      state: issue.state,
      repositoryId: repository.id,
      repositoryName: repository.name,
      repositoryFullName: repository.full_name,
      labels: issue.labels.map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
      comments: issue.comments || 0,
      author: {
        login: issue.user?.login || 'unknown',
        avatarUrl: issue.user?.avatar_url,
        url: issue.user?.html_url,
      },
      url: issue.html_url,
    }));
};

const fetchAllIssues = async (username, signal) => {
  const repositories = await fetchAllRepositories(username, signal);

  if (!repositories.length) return [];

  const issueResults = await Promise.all(
    repositories.map((repository) => fetchRepositoryIssues(repository, signal))
  );

  if (signal?.aborted) {
    throw new DOMException('Issues request aborted.', 'AbortError');
  }

  return issueResults.flat().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const getIssues = async (username, { signal, forceRefresh = false } = {}) => {
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

  const request = fetchAllIssues(normalizedUsername, signal)
    .then((issues) => {
      writeCache(normalizedUsername, issues);
      return issues;
    })
    .finally(() => {
      inFlightRequests.delete(requestKey);
    });

  inFlightRequests.set(requestKey, request);
  return request;
};

export const getIssueCacheMeta = (username) => {
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
