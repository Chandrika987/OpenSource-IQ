const GITHUB_API_BASE_URL = 'https://api.github.com';

export const getRateLimitResetMessage = (response) => {
  const reset = response.headers.get('x-ratelimit-reset');
  if (!reset) return 'GitHub API rate limit exceeded. Please try again later.';

  const resetTime = new Date(Number(reset) * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `GitHub API rate limit exceeded. Please try again after ${resetTime}.`;
};

export const requestGitHub = async (url, signal) => {
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
    throw new Error('Failed to fetch data from GitHub.');
  }

  return response.json();
};

export const fetchGitHubUser = (username, signal) =>
  requestGitHub(`${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}`, signal);

export const fetchGitHubRepos = (username, signal) =>
  requestGitHub(
    `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    signal
  );

export const computeOpenSourceScore = (profile, repos = []) => {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const recentRepos = repos.filter((repo) => {
    const updated = new Date(repo.updated_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return updated >= sixMonthsAgo;
  }).length;

  const score = Math.round(
    Math.log10((profile.followers || 0) + 1) * 20 +
      Math.log10(totalStars + 1) * 30 +
      Math.log10(totalForks + 1) * 15 +
      (profile.public_repos || 0) * 2 +
      recentRepos * 5
  );

  return {
    score: Math.min(score, 100),
    totalStars,
    totalForks,
    recentRepos,
  };
};
