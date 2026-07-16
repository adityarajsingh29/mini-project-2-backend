import { fetchGithubUser, fetchAllGithubRepos } from "../utils/githubApi.js";
import SearchHistory from "../models/SearchHistory.js";

/**
 * GET /api/github/:username
 * Returns the raw GitHub profile plus a lightweight derived summary.
 * Also logs the lookup to search history (fire-and-forget, non-blocking
 * for the response but awaited so failures don't crash the process).
 */
export const getGithubProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username || !username.trim()) {
      const err = new Error("Username is required");
      err.statusCode = 400;
      throw err;
    }

    const profile = await fetchGithubUser(username);

    // Log to history, but don't let a logging failure break the request.
    SearchHistory.create({ username: profile.login }).catch((e) =>
      console.error("Failed to log search history:", e.message)
    );

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/github/:username/repos
 * Returns all repositories plus derived analytics: totals, language
 * breakdown, most starred/forked, and the most recently updated repo.
 */
export const getGithubRepos = async (req, res, next) => {
  try {
    const { username } = req.params;
    const repos = await fetchAllGithubRepos(username);

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
    const totalOpenIssues = repos.reduce((sum, r) => sum + r.open_issues_count, 0);
    const totalWatchers = repos.reduce((sum, r) => sum + r.watchers_count, 0);
    const totalSizeKb = repos.reduce((sum, r) => sum + r.size, 0);

    const languageCounts = {};
    repos.forEach((r) => {
      if (r.language) {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
      }
    });
    const languageBreakdown = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: repos.length ? Number(((count / repos.length) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const mostStarred = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || null;
    const mostForked = [...repos].sort((a, b) => b.forks_count - a.forks_count)[0] || null;
    const recentlyUpdated = [...repos].sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    )[0] || null;

    res.json({
      success: true,
      data: {
        repos,
        analytics: {
          totalRepositories: repos.length,
          totalStars,
          totalForks,
          totalOpenIssues,
          totalWatchers,
          totalSizeKb,
          averageStars: repos.length ? Number((totalStars / repos.length).toFixed(1)) : 0,
          averageForks: repos.length ? Number((totalForks / repos.length).toFixed(1)) : 0,
          languageBreakdown,
          mostStarred,
          mostForked,
          recentlyUpdated,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
