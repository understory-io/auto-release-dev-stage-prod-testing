import { getOctokit } from "@actions/github";

export async function assignReviewers({ owner, repo, number, token, debug }) {
  const octokit = getOctokit(token);

  let commits;

  try {
    commits = await octokit.rest.pulls.listCommits({
      owner: owner,
      repo: repo,
      pull_number: number,
    });
    debug("Commits: " + JSON.stringify(commits));
  } catch (error) {
    throw new Error("Failed to list commits", {
      cause: error,
    });
  }

  // deduplicate authors in case of multiple commits by the same author
  const authors = [
    ...new Set(commits.data.map((commit) => commit.author.login)),
  ];

  debug(`Authors: ${authors}`);

  const result = await octokit.rest.pulls.requestReviewers({
    owner: owner,
    repo: repo,
    pull_number: number,
    reviewers: authors,
  });

  debug("request reviewers " + JSON.stringify(result));

  return authors;
}
