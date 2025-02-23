import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run(context) {
  try {
    const target = context.payload.pull_request;
    if (target === undefined) {
      throw new Error("Can't get payload. Check you trigger event");
    }
    const { number } = target;

    const token = core.getInput("token", { required: true });
    const octokit = getOctokit(token);

    let commits;
    try {
      commits = await octokit.rest.pulls.listCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: number,
      });
    } catch (error) {
      core.error("failed to list commits");
      throw error;
    }

    // deduplicate authors in case of multiple commits by the same author
    const authors = [
      ...new Set(commits.data.map((commit) => commit.author.login)),
    ];

    core.info(`Authors: ${authors}`);

    const result = await octokit.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: number,
      reviewers: authors,
    });

    core.debug(JSON.stringify(result));
    core.info(`@${author} has been assigned to the pull request: #${number}`);
  } catch (error) {
    core.debug("context.payload: " + JSON.stringify(context.payload));
    core.error(error);
    core.setFailed(error.message);
  }
}

run(context);
