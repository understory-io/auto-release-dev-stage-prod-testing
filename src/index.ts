import * as core from "@actions/core";
import { context } from "@actions/github";
import { assignReviewers } from "./assignReviewers";

async function run() {
  try {
    const target = context.payload.pull_request;
    if (target === undefined) {
      throw new Error("Can't get payload. Check you trigger event");
    }
    const { number } = target;

    const token = core.getInput("token", { required: true });

    const authors = await assignReviewers({
      number,
      token,
      debug: core.debug,
      owner: context.repo.owner,
      repo: context.repo.repo,
    });

    core.info(`@${authors} has been assigned to the pull request: #${number}`);
  } catch (error: any) {
    core.debug("context.payload: " + JSON.stringify(context.payload));
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
