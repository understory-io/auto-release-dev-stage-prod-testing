import { getOctokit } from "@actions/github";

export async function assignReviewers({
  owner,
  repo,
  number,
  token,
  debug,
}: {
  owner: string;
  repo: string;
  number: number;
  token: string;
  debug: (message: string) => void;
}) {
  const octokit = getOctokit(token);

  let commits;

  try {
    commits = await octokit.rest.pulls.listCommits({
      owner: owner,
      repo: repo,
      pull_number: number,
    });
    debug("Commits: " + JSON.stringify(commits));
  } catch (error: any) {
    throw new Error("Failed to list commits: " + error.message); // TODO: add cause
  }

  // deduplicate authors in case of multiple commits by the same author
  const authors = [
    ...new Set<string>(
      commits.data.map((commit) => commit.author?.login as string)
    ),
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
