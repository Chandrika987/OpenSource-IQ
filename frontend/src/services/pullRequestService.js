const GITHUB_API_BASE_URL = 'https://api.github.com';
const CACHE_DURATION_MS = 10 * 60 * 1000;
const inFlightRequests = new Map();

const getCacheKey = (username) => `github_pull_requests_${username.toLowerCase()}`;

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
    throw new Error('Failed to fetch GitHub pull requests.');
  }

  return response.json();
};

const fetchAllRepositories = async (username, signal) => {
  const repositories = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    // Endpoint: list public repositories owned by the selected user.
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

const normalizePullRequest = (pullRequest, repository) => {
  const status = pullRequest.merged_at ? 'merged' : pullRequest.state;

  // Transformation: flatten GitHub's nested pull request payload into the card/chart shape used by the UI.
  return {
    id: pullRequest.id,
    title: pullRequest.title,
    number: pullRequest.number,
    state: pullRequest.state,
    status,
    repositoryId: repository.id,
    repositoryName: repository.name,
    repositoryFullName: repository.full_name,
    author: {
      login: pullRequest.user?.login || 'unknown',
      avatarUrl: pullRequest.user?.avatar_url,
      url: pullRequest.user?.html_url,
    },
    createdAt: pullRequest.created_at,
    updatedAt: pullRequest.updated_at,
    closedAt: pullRequest.closed_at,
    mergedAt: pullRequest.merged_at,
    comments: (pullRequest.comments || 0) + (pullRequest.review_comments || 0),
    url: pullRequest.html_url,
  };
};

const fetchRepositoryPullRequests = async (repository, signal) => {
  const pullRequests = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    // Endpoint: list pull requests for each repository with state=all so open, closed, and merged PRs are captured.
    const data = await requestJson(
      `${GITHUB_API_BASE_URL}/repos/${repository.full_name}/pulls?state=all&per_page=100&page=${page}&sort=updated&direction=desc`,
      signal
    );

    pullRequests.push(...data.map((pullRequest) => normalizePullRequest(pullRequest, repository)));
    hasMore = data.length === 100;
    page += 1;
  }

  return pullRequests;
};

const fetchAllPullRequests = async (username, signal) => {
  const repositories = await fetchAllRepositories(username, signal);

  if (!repositories.length) return [];

  // Rate-limit optimization: fetch each repository's PR list exactly once and cache the flattened result for 10 minutes.
  const results = await Promise.all(
    repositories.map((repository) => fetchRepositoryPullRequests(repository, signal))
  );

  if (signal?.aborted) {
    throw new DOMException('Pull request request aborted.', 'AbortError');
  }

  return results.flat().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const getPullRequests = async (username, { signal, forceRefresh = false } = {}) => {
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

  const request = fetchAllPullRequests(normalizedUsername, signal)
    .then((pullRequests) => {
      writeCache(normalizedUsername, pullRequests);
      return pullRequests;
    })
    .finally(() => {
      inFlightRequests.delete(requestKey);
    });

  inFlightRequests.set(requestKey, request);
  return request;
};

export const getPullRequestCacheMeta = (username) => {
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
