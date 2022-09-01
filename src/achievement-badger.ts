import { Badger } from './badger';

export class AchievementBadger extends Badger {
  public async runBadgerWorkflow() {
    const username = await this.getGitHubUsername();

    if (this.ignoreThisUsername(username)) {
      console.log(`Detected ${username} in the list of ignored users. Exiting`);
      return;
    }

    const pullRequests = await this.getRelevantPullRequests(username);
    const badge = this.determineBadge(pullRequests);
    await this.addLabel(badge);
    await this.writeComment(badge, username);
  }

  public determineBadge(pullRequests: any[]): number {
    const mergedPulls = pullRequests.length;

    for (let i = 0; i < this.badges.length; i++) {
      if (this.badges[i].threshold < mergedPulls) {
        continue;
      }
      return i;
    }

    return this.badges.length-1;
  }
}