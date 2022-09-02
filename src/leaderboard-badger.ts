import { Badger } from './badger';

/**
 * A Badger that measures how many merged PRs a user has made to a repository compared
 * to other contributors. For example, if a user has 5 merged PRs, and that is good for
 * 10th out of all other contributors, then the result of `determineRating()` will be
 * 10.
 */
export class LeaderboardBadger extends Badger {
  public async runBadgerWorkflow() {
    const username = await this.getGitHubUsername();
    if (this.ignoreThisUsername(username)) {
      console.log(`Detected ${username} in the list of ignored users. Exiting`);
      return;
    }

    const pullRequests = await this.getRelevantPullRequests();
    const badgeIndex = this.determineBadge(this.determineRating(pullRequests, username));
    await this.addLabel(badgeIndex);
    await this.writeComment(badgeIndex, username);
  }

  public determineRating(pullRequests: any[], username?: string): number {
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
    if (index < 0) { return sortedUsernames.length; }

    console.log(sortedUsernames);
    return index - 1;
  }
}