import axios from "axios";
import NodeCache from "node-cache";

// Cache GitHub responses for 5 minutes to reduce rate-limit pressure
// and speed up repeated lookups of popular profiles.
const cache = new NodeCache({ stdTTL: 300 });

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  },
  timeout: 10000,
});

/**
 * Wraps a GitHub GET request with an in-memory cache and consistent
 * error normalization (404 -> "not found", 403 -> "rate limited").
 */
async function githubGet(path, cacheKey) {
  const key = cacheKey || path;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const { data } = await githubClient.get(path);
    cache.set(key, data);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const notFoundError = new Error("GitHub user not found");
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    if (
      error.response?.status === 403 &&
      error.response?.headers["x-ratelimit-remaining"] === "0"
    ) {
      const rateLimitError = new Error(
        "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN."
      );
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }
    const genericError = new Error("Failed to reach GitHub API");
    genericError.statusCode = 502;
    throw genericError;
  }
}

export async function fetchGithubUser(username) {
  return githubGet(`/users/${username}`, `user:${username}`);
}

export async function fetchGithubRepos(username, page = 1, perPage = 100) {
  return githubGet(
    `/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
    `repos:${username}:${page}:${perPage}`
  );
}

export async function fetchAllGithubRepos(username) {
  const cacheKey = `repos-all:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let page = 1;
  let allRepos = [];
  // GitHub paginates at 100/page max; walk pages until exhausted.
  while (true) {
    const repos = await fetchGithubRepos(username, page, 100);
    allRepos = allRepos.concat(repos);
    if (repos.length < 100) break;
    page += 1;
    if (page > 10) break; // safety cap at 1000 repos
  }

  cache.set(cacheKey, allRepos);
  return allRepos;
}

export default githubClient;
