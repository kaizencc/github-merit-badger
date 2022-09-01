import { Badger } from './badger';

export class LeaderboardBadger extends Badger {
  public async runBadgerWorkflow() {
    const username = await this.getGitHubUsername();
    if (this.ignoreThisUsername(username)) {
      console.log(`Detected ${username} in the list of ignored users. Exiting`);
      return;
    }

    const pullRequests = await this.getRelevantPullRequests();
    const badgeIndex = this.determineBadge(this.determineThreshold(pullRequests, username));
    await this.addLabel(badgeIndex);
    await this.writeComment(badgeIndex, username);
  }

  public determineThreshold(pullRequests: any[], username?: string): number {
    const usernames: Record<string, number> = {};
    for (const pull of pullRequests) {
      if (usernames[pull.user.login]) {
        usernames[pull.user.login]++;
      } else {
        usernames[pull.user.login] = 1;
      }
    }

    const sortedUsernames = Object.entries(usernames);
    sortedUsernames.sort((a, b) => b[1] - a[1]);

    const index = sortedUsernames.findIndex(([usr, _amount]) => username === usr);

    console.log('index', index);

    // contributor has no prior merged PRs
    if (!index) { return sortedUsernames.length; }

    console.log(sortedUsernames);
    return index - 1;
  }
}