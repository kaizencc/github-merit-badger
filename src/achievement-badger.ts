import { Badger } from './badger';

/**
 * A Badger that keeps track of how many merged PRs a user has in the GitHub repository.
 * For example, if the user has 5 merged PRs in the given time frame, then `determineRating()`
 * will return 5.
 */
export class AchievementBadger extends Badger {
  public async runBadgerWorkflow() {
    const username = await this.getGitHubUsername();

    if (this.ignoreThisUsername(username)) {
      console.log(`Detected ${username} in the list of ignored users. Exiting`);
      return;
    }

    const pullRequests = await this.getRelevantPullRequests(username);

    console.log(JSON.stringify(pullRequests));
    const badgeIndex = this.determineBadge(this.determineRating(pullRequests));
    await this.addLabel(badgeIndex);
    await this.writeComment(badgeIndex, username);
  }

  public determineRating(pullRequests: any[]): number {
    const mergedPulls = pullRequests.length;
    console.log(`We found ${mergedPulls} pull requests`);
    return mergedPulls;
  }
}