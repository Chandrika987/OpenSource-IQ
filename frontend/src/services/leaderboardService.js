import { computeOpenSourceScore, fetchGitHubRepos, fetchGitHubUser } from './githubApi';

const CURATED_CONTRIBUTORS = [
  'torvalds',
  'gaearon',
  'tj',
  'sindresorhus',
  'addyosmani',
  'kentcdodds',
  'yyx990803',
  'antirez',
  'fabpot',
  'tjholowaychuk',
];

const CACHE_KEY = 'leaderboard_cache';
const CACHE_DURATION_MS = 10 * 60 * 1000;

const readCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) return null;

    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
};

const fetchContributor = async (username, signal) => {
  const [profile, repos] = await Promise.all([
    fetchGitHubUser(username, signal),
    fetchGitHubRepos(username, signal),
  ]);

  const metrics = computeOpenSourceScore(profile, repos);

  return {
    username: profile.login,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    profileUrl: profile.html_url,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    totalStars: metrics.totalStars,
    totalForks: metrics.totalForks,
    recentRepos: metrics.recentRepos,
    score: metrics.score,
  };
};

export const getLeaderboard = async ({ signal, forceRefresh = false } = {}) => {
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) return cached;
  }

  const results = await Promise.allSettled(
    CURATED_CONTRIBUTORS.map((username) => fetchContributor(username, signal))
  );

  const leaderboard = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  writeCache(leaderboard);
  return leaderboard;
};

export const getCurrentUserRank = (leaderboard, username) => {
  if (!username) return null;
  const entry = leaderboard.find((item) => item.username.toLowerCase() === username.toLowerCase());
  return entry || null;
};
