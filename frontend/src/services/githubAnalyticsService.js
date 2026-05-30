const GITHUB_API_BASE_URL = 'https://api.github.com';
const CACHE_DURATION_MS = 5 * 60 * 1000;
const inFlightRequests = new Map();

const getCacheKey = (username) => `github_analytics_${username.toLowerCase()}`;

const readCache = (username) => {
  try {
    const cached = localStorage.getItem(getCacheKey(username));
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed?.timestamp || !parsed?.data) return null;

    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_DURATION_MS) {
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

const getRateLimitResetMessage = (response) => {
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
    throw new Error(getRateLimitResetMessage(response));
  }

  if (response.status === 404) {
    throw new Error('GitHub user not found.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch live GitHub analytics.');
  }

  return response.json();
};

const fetchAllRepositories = async (username, signal) => {
  const firstPage = await requestJson(
    `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100&page=1&sort=updated&type=owner`,
    signal
  );

  if (firstPage.length < 100) return firstPage;

  const repositories = [...firstPage];
  let page = 2;
  let hasMore = true;

  while (hasMore) {
    const nextPage = await requestJson(
      `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      signal
    );

    repositories.push(...nextPage);
    hasMore = nextPage.length === 100;
    page += 1;
  }

  return repositories;
};

const buildLanguageDistribution = (languageResults) => {
  const totals = languageResults.reduce((acc, result) => {
    if (result.status !== 'fulfilled' || !result.value) return acc;

    Object.entries(result.value).forEach(([language, bytes]) => {
      acc[language] = (acc[language] || 0) + bytes;
    });

    return acc;
  }, {});

  const totalBytes = Object.values(totals).reduce((sum, bytes) => sum + bytes, 0);

  return Object.entries(totals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      value: Number(((bytes / totalBytes) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.bytes - a.bytes);
};

const buildAnalytics = async (username, signal) => {
  const [profile, repositories] = await Promise.all([
    requestJson(`${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}`, signal),
    fetchAllRepositories(username, signal),
  ]);

  const languageResults = await Promise.allSettled(
    repositories.map((repo) => requestJson(repo.languages_url, signal))
  );

  if (signal?.aborted) {
    throw new DOMException('Analytics request aborted.', 'AbortError');
  }

  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalOpenIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);

  const topStarredRepositories = [...repositories]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((repo) => ({
      name: repo.name,
      stars: repo.stargazers_count,
      url: repo.html_url,
    }));

  const repositoryActivity = [...repositories]
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
    .map((repo, index) => ({
      name: repo.name,
      activity: index + 1,
      updatedAt: repo.updated_at,
      updatedDate: new Date(repo.updated_at).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }),
    }));

  return {
    username,
    fetchedAt: new Date().toISOString(),
    profile,
    repositories,
    metrics: {
      publicRepositories: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      totalStars,
      totalForks,
      totalOpenIssues,
    },
    charts: {
      languageDistribution: buildLanguageDistribution(languageResults),
      topStarredRepositories,
      repositoryActivity,
    },
  };
};

export const getGitHubAnalytics = async (username, { signal, forceRefresh = false } = {}) => {
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

  const request = buildAnalytics(normalizedUsername, signal)
    .then((data) => {
      writeCache(normalizedUsername, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(requestKey);
    });

  inFlightRequests.set(requestKey, request);
  return request;
};

export const getGitHubAnalyticsCacheMeta = (username) => {
  try {
    const cached = localStorage.getItem(getCacheKey(username));
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed?.timestamp) return null;

    const expiresAt = parsed.timestamp + CACHE_DURATION_MS;
    return {
      timestamp: parsed.timestamp,
      expiresAt,
      isExpired: Date.now() >= expiresAt,
    };
  } catch {
    return null;
  }
};
