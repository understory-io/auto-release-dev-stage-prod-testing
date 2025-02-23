import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
  try {
    const target = context.payload.pull_request;
    if (target === undefined) {
      throw new Error("Can't get payload. Check you trigger event");
    }
    const { number } = target;

    const token = core.getInput("repo-token", { required: true });
    const octokit = getOctokit(token);

    const commits = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: number,
    });

    const authors = commits.data.map((commit) => commit.author.login);

    const result = await octokit.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: number,
      reviewers: [authors],
    });

    core.debug(JSON.stringify(result));
    core.info(`@${author} has been assigned to the pull request: #${number}`);
  } catch (error) {
    core.info("Payload: " + JSON.stringify(context.payload));
    core.setFailed(error.message);
  }
}

run();
