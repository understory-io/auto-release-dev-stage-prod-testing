import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
  try {
    const target = context.payload.pull_request;
    if (target === undefined) {
      core.info("Payload: " + JSON.stringify(context.payload));
      throw new Error("Can't get payload. Check ydou trigger event");
    }
    const {
      pull_request: { requested_reviewers: reviews },
      number,
      user: { login: author, type },
    } = target;

    if (type === "Bot") {
      core.info("Assigning author has been skipped since the author is a bot");
      return;
    }

    const token = core.getInput("repo-token", { required: true });
    const octokit = getOctokit(token);

    const result = await octokit.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: number,
      reviewers: [...reviews, author],
    });

    core.debug(JSON.stringify(result));
    core.info(`@${author} has been assigned to the pull request: #${number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
