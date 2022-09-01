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
    const badgeIndex = this.determineBadge(pullRequests);
    await this.addLabel(badgeIndex);
    await this.writeComment(badgeIndex, username);
  }

  public determineBadge(pullRequests: any[]): number {
    const mergedPulls = pullRequests.length;

    console.log(`We found ${mergedPulls} pull requests`);

    for (let i = 0; i < this.badges.length; i++) {
      if (this.badges[i].threshold < mergedPulls) {
        continue;
      }
      return i;
    }

    return this.badges.length-1;
  }
}