export const generatePortfolioInsights = (analytics) => {
  if (!analytics?.profile || !analytics?.repositories) {
    return { summary: '', insights: [], recommendations: [] };
  }

  const { profile, repositories, metrics, charts } = analytics;
  const languages = charts.languageDistribution || [];
  const topLanguage = languages[0]?.name || 'N/A';
  const languageCount = languages.length;
  const avgStars = repositories.length
    ? Math.round(metrics.totalStars / repositories.length)
    : 0;

  const recentActivity = repositories.filter((repo) => {
    const updated = new Date(repo.updated_at);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return updated >= threeMonthsAgo;
  }).length;

  const activityLevel =
    recentActivity >= 5 ? 'high' : recentActivity >= 2 ? 'moderate' : 'low';

  const insights = [];

  if (metrics.totalStars >= 100) {
    insights.push({
      type: 'strength',
      title: 'Strong Community Impact',
      description: `Your repositories have earned ${metrics.totalStars.toLocaleString()} stars, showing meaningful community adoption.`,
    });
  } else if (metrics.totalStars > 0) {
    insights.push({
      type: 'growth',
      title: 'Growing Visibility',
      description: `You have ${metrics.totalStars} total stars across ${repositories.length} repositories — a solid foundation to build on.`,
    });
  }

  if (languageCount >= 4) {
    insights.push({
      type: 'strength',
      title: 'Polyglot Developer',
      description: `You work across ${languageCount} languages, with ${topLanguage} as your primary focus.`,
    });
  } else {
    insights.push({
      type: 'focus',
      title: 'Focused Expertise',
      description: `${topLanguage} dominates your codebase — consider showcasing depth in this stack.`,
    });
  }

  if (activityLevel === 'high') {
    insights.push({
      type: 'strength',
      title: 'Active Contributor',
      description: `${recentActivity} repositories updated in the last 3 months — excellent consistency.`,
    });
  } else if (activityLevel === 'moderate') {
    insights.push({
      type: 'growth',
      title: 'Steady Activity',
      description: `${recentActivity} repositories updated recently. Increasing commit frequency could boost your visibility.`,
    });
  } else {
    insights.push({
      type: 'opportunity',
      title: 'Re-engagement Opportunity',
      description: 'Limited recent activity detected. Regular contributions signal reliability to recruiters.',
    });
  }

  if (profile.followers >= 500) {
    insights.push({
      type: 'strength',
      title: 'Established Presence',
      description: `${profile.followers.toLocaleString()} followers reflect a recognized presence in the open source community.`,
    });
  }

  const recommendations = [];

  if (avgStars < 5 && repositories.length > 3) {
    recommendations.push('Focus on README quality and project documentation to improve discoverability.');
  }
  if (metrics.totalOpenIssues > repositories.length * 2) {
    recommendations.push('Consider triaging open issues — responsive maintainers attract more contributors.');
  }
  if (languageCount === 1) {
    recommendations.push('Explore a side project in a complementary language to broaden your portfolio.');
  }
  if (activityLevel === 'low') {
    recommendations.push('Set a goal of 2-3 commits per week to build a visible contribution streak.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Keep maintaining your top repositories and consider writing technical blog posts about your projects.');
  }

  const consistencyScore = Math.min(
    100,
    Math.round(
      (activityLevel === 'high' ? 40 : activityLevel === 'moderate' ? 25 : 10) +
        Math.min(metrics.totalStars / 10, 30) +
        Math.min(languageCount * 5, 20) +
        Math.min(profile.followers / 50, 10)
    )
  );

  const summary = `${profile.login} is a ${activityLevel}-activity open source contributor with ${repositories.length} public repositories, ${metrics.totalStars} total stars, and expertise primarily in ${topLanguage}.`;

  return {
    summary,
    insights,
    recommendations,
    consistencyScore,
    avgStars,
    activityLevel,
  };
};
