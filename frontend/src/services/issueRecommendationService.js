const TECH_STACKS = [
  { value: 'javascript', label: 'JavaScript', aliases: ['javascript', 'js'] },
  { value: 'java', label: 'Java', aliases: ['java'] },
  { value: 'spring-boot', label: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring'] },
  { value: 'react', label: 'React', aliases: ['react', 'reactjs', 'jsx'] },
  { value: 'nextjs', label: 'Next.js', aliases: ['next.js', 'nextjs', 'next'] },
  { value: 'nodejs', label: 'Node.js', aliases: ['node.js', 'nodejs', 'node'] },
  { value: 'python', label: 'Python', aliases: ['python', 'py'] },
  { value: 'docker', label: 'Docker', aliases: ['docker', 'container'] },
  { value: 'kubernetes', label: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
];

const DOMAINS = [
  { value: 'frontend', label: 'Frontend', aliases: ['frontend', 'front-end', 'ui', 'ux', 'css', 'html', 'react', 'next.js'] },
  { value: 'backend', label: 'Backend', aliases: ['backend', 'back-end', 'api', 'server', 'database', 'spring', 'node'] },
  { value: 'full-stack', label: 'Full Stack', aliases: ['fullstack', 'full-stack', 'full stack'] },
  { value: 'devops', label: 'DevOps', aliases: ['devops', 'ci', 'cd', 'pipeline', 'docker', 'kubernetes', 'deploy'] },
  { value: 'ai-ml', label: 'AI/ML', aliases: ['ai', 'ml', 'machine learning', 'model', 'llm', 'data science'] },
  { value: 'documentation', label: 'Documentation', aliases: ['docs', 'documentation', 'readme', 'guide', 'tutorial'] },
  { value: 'testing', label: 'Testing', aliases: ['test', 'testing', 'spec', 'coverage', 'qa'] },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner', aliases: ['good first issue', 'beginner', 'easy', 'starter', 'first-timers-only'] },
  { value: 'intermediate', label: 'Intermediate', aliases: ['medium', 'intermediate', 'enhancement', 'refactor'] },
  { value: 'advanced', label: 'Advanced', aliases: ['hard', 'advanced', 'architecture', 'performance', 'security'] },
];

const normalize = (value = '') => value.toString().toLowerCase();

const getIssueText = (issue) =>
  normalize(
    [
      issue.title,
      issue.repositoryName,
      issue.repositoryFullName,
      issue.repositoryLanguage,
      ...(issue.repositoryTopics || []),
      ...(issue.labels || []).map((label) => label.name),
    ].join(' ')
  );

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasAlias = (text, aliases) =>
  aliases.some((alias) => {
    if (/^[a-z0-9]+$/.test(alias) && alias.length <= 6) {
      return new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`).test(text);
    }

    return text.includes(alias);
  });

export const recommendationOptions = {
  techStacks: TECH_STACKS,
  domains: DOMAINS,
  difficulties: DIFFICULTIES,
};

export const getIssueRecommendation = (issue, preferences) => {
  const issueText = getIssueText(issue);
  const labels = (issue.labels || []).map((label) => normalize(label.name));

  const techMatches = TECH_STACKS.filter((tech) => hasAlias(issueText, tech.aliases));
  const domainMatches = DOMAINS.filter((domain) => hasAlias(issueText, domain.aliases));
  const inferredDifficulty =
    DIFFICULTIES.find((difficulty) => hasAlias(issueText, difficulty.aliases)) ||
    (labels.some((label) => label.includes('bug')) ? DIFFICULTIES[1] : DIFFICULTIES[0]);

  const selectedTech = preferences.techStack === 'all'
    ? []
    : TECH_STACKS.filter((tech) => tech.value === preferences.techStack);
  const selectedDomain = preferences.domain === 'all'
    ? []
    : DOMAINS.filter((domain) => domain.value === preferences.domain);

  const techScore =
    preferences.techStack === 'all'
      ? Math.min(techMatches.length * 8, 24)
      : selectedTech.some((tech) => hasAlias(issueText, tech.aliases))
        ? 35
        : 0;
  const domainScore =
    preferences.domain === 'all'
      ? Math.min(domainMatches.length * 7, 18)
      : selectedDomain.some((domain) => hasAlias(issueText, domain.aliases))
        ? 20
        : 0;
  const difficultyScore =
    preferences.difficulty === 'all' || inferredDifficulty.value === preferences.difficulty ? 15 : 4;

  const openIssueLoad = issue.repositoryOpenIssues || 0;
  const stars = issue.repositoryStars || 0;
  const forks = issue.repositoryForks || 0;
  const resolutionRate = issue.repositoryHealth?.resolutionRate || 0;
  const repoUpdatedAt = new Date(issue.repositoryUpdatedAt || issue.updatedAt).getTime();
  const daysSinceRepoUpdate = Number.isFinite(repoUpdatedAt)
    ? (Date.now() - repoUpdatedAt) / (1000 * 60 * 60 * 24)
    : 365;

  const healthScore =
    Math.min(stars / 20, 5) +
    Math.min(forks / 10, 4) +
    Math.min(resolutionRate * 4, 4) +
    (openIssueLoad > 0 && openIssueLoad < 40 ? 4 : 2) +
    (daysSinceRepoUpdate <= 30 ? 4 : daysSinceRepoUpdate <= 90 ? 2 : 0);
  const recencyScore =
    (Date.now() - new Date(issue.updatedAt).getTime()) / (1000 * 60 * 60 * 24) <= 14 ? 10 : 5;
  const engagementScore = Math.min((issue.comments || 0) * 1.5, 5);

  const score = Math.min(
    100,
    Math.round(techScore + domainScore + difficultyScore + healthScore + recencyScore + engagementScore)
  );

  const matchedTechLabels = techMatches.map((tech) => tech.label);
  const matchedDomainLabels = domainMatches.map((domain) => domain.label);
  const reasons = [
    matchedTechLabels.length ? `Tech match: ${matchedTechLabels.slice(0, 3).join(', ')}` : null,
    matchedDomainLabels.length ? `Domain: ${matchedDomainLabels.slice(0, 2).join(', ')}` : null,
    `Difficulty: ${inferredDifficulty.label}`,
    resolutionRate > 0 ? `${Math.round(resolutionRate * 100)}% issue resolution rate` : null,
    daysSinceRepoUpdate <= 90 ? 'Repository is actively maintained' : null,
    openIssueLoad > 0 ? `${openIssueLoad} open repository issues for contribution discovery` : null,
  ].filter(Boolean);

  return {
    score,
    technologies: matchedTechLabels.length ? matchedTechLabels : [issue.repositoryLanguage || 'General'],
    technologyValues: techMatches.map((tech) => tech.value),
    domains: matchedDomainLabels.length ? matchedDomainLabels : ['General'],
    domainValues: domainMatches.map((domain) => domain.value),
    difficulty: inferredDifficulty,
    reasons,
    health: {
      stars,
      forks,
      openIssues: openIssueLoad,
      resolutionRate,
      recentlyUpdated: daysSinceRepoUpdate <= 90,
    },
  };
};
