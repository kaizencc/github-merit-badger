import { Badger } from './badger';

export class AchievementBadger extends Badger {
  public async runBadgerWorkflow() {
    const username = await this.getGitHubUsername();

    if (this.ignoreThisUsername(username)) {
      console.log(`Detected ${username} in the list of ignored users. Exiting`);
      return;
    }

    const pullRequests = await this.getRelevantPullRequests(username);

    console.log(JSON.stringify(pullRequests));
    const badgeIndex = this.determineBadge(this.determineThreshold(pullRequests));
    await this.addLabel(badgeIndex);
    await this.writeComment(badgeIndex, username);
  }

  public determineThreshold(pullRequests: any[]): number {
    const mergedPulls = pullRequests.length;
    console.log(`We found ${mergedPulls} pull requests`);
    return mergedPulls;
  }
}