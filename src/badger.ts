import * as core from '@actions/core';
import * as github from '@actions/github';

const BADGER_METADATA = '<!--merit badge comment-->';

export interface BadgerProps {
  readonly days?: number;
  readonly token: string;
  readonly badges: string[];
  readonly badgeDescriptions?: string[];
  readonly thresholds: number[];
  readonly ignoreUsernames: string[];
  readonly prefixes?: string[];
}

interface BadgeInfo {
  readonly name: string;
  readonly description?: string;
  readonly threshold: number;
}

export abstract class Badger {
  private octokit;
  private repo: RepositoryInfo;
  private pullRequestNumber: number;
  private timestampDate?: Date;
  private ignoreUsernames?: string[];
  private doWriteComment: boolean;
  private prefixes?: string[];

  public badges: BadgeInfo[] = [];

  constructor(props: BadgerProps) {
    this.octokit = github.getOctokit(props.token);
    this.repo = github.context.repo;

    if (github.context.payload.pull_request) {
      this.pullRequestNumber = github.context.payload.pull_request.number;
    } else {
      core.setFailed('This Action can only be run on pull requests');
      throw new Error('This Action can only be run on pull requests');
    }

    this.timestampDate = props.days ? daysToDate(props.days) : undefined;
    this.ignoreUsernames = props.ignoreUsernames;
    this.doWriteComment = props.badgeDescriptions ? true : false;
    this.prefixes = props.prefixes;

    for (let i = 0; i < props.badges.length; i++) {
      this.badges.push({
        name: props.badges[i],
        description: props.badgeDescriptions ? props.badgeDescriptions[i] : undefined,
        threshold: props.thresholds[i],
      });
    }
  }

  /**
   * The Badger Workflow is the entry point to the Badger class. It is implemented by subclasses
   * primarily for ease of use; we do not want to be opinionated on how to use the Badger class.
   */
  public abstract runBadgerWorkflow(): Promise<void>;

  /**
   * This function will be implemented by subclasses of Badger with the intent that it
   * will calculate a number that will be compared to the thresholds supplied to the action.
   *
   * For example, if the thresholds given are [0,3,5] and determineRating() returns 4, then
   * it will be matched with the middle bucket.
   */
  public abstract determineRating(pullRequests: any[], username?: string): number;

  protected ignoreThisUsername(username: string) {
    return this.ignoreUsernames?.includes(username);
  }

  protected determineBadge(thresholdNumber: number) {
    for (let i = 0; i < this.badges.length; i++) {
      if (this.badges[i].threshold > thresholdNumber) {
        return i-1;
      }
    }

    return this.badges.length-1;
  }

  protected async getGitHubUsername() {
    const { data } = await this.octokit.rest.issues.get({
      owner: this.repo.owner,
      repo: this.repo.repo,
      issue_number: this.pullRequestNumber,
    });

    const user = data.user?.login;
    console.log('username: ', user);

    if (!user) {
      core.setFailed(`No GitHub username found for pull request number ${this.pullRequestNumber}`);
      throw new Error(`No GitHub username found for pull request number ${this.pullRequestNumber}`);
    }

    return user;
  }

  protected async getRelevantPullRequests(username?: string) {
    const issues = await this.octokit.paginate(this.octokit.rest.issues.listForRepo, {
      owner: this.repo.owner,
      repo: this.repo.repo,
      state: 'closed',
      creator: username,
    }).catch(error => {
      core.setFailed(error.message);
    });

    if (!issues) {
      console.log('no pull requests found');
      return [];
    }

    return issues.filter((issue) => {
      // filter out issues that are not pull requests and not merged
      const mergedAt = issue.pull_request?.merged_at;
      if (!mergedAt) { return false; }

      // filter out pull requests that do not start with the given list of prefixes
      if (this.prefixes && this.prefixes.length > 0 && !this.prefixes?.some((prefix) => issue.title.startsWith(prefix))) {
        return false;
      }

      // filter out pull requests that are merged before a timestamp
      if (!this.timestampDate) { return true; }
      return this.timestampDate < new Date(mergedAt);
    });
  }

  protected async addLabel(badgeIndex: number) {
    await this.octokit.rest.issues.addLabels({
      owner: this.repo.owner,
      repo: this.repo.repo,
      issue_number: this.pullRequestNumber,
      labels: [this.badges[badgeIndex].name],
    });
  }

  protected async writeComment(badgeIndex: number, username: string, additionalInfo?: string) {
    if (!this.doWriteComment) { return; }

    const badge = this.badges[badgeIndex];
    const comment = [
      `${BADGER_METADATA}\n`,
      `Welcome @${username}`,
      `You are ${beginsWithVowel(badge.name) ? 'an' : 'a'}`,
      `${badge.name},`,
      `which means that ${this.badges[badgeIndex].description}`,
      'Keep up the good work!\n\n',
      additionalInfo ? `${additionalInfo}\n\n` : '',
      '----\n\n',
      'This comment brought to you by the Community Badger ([source code](https://github.com/kaizencc/github-merit-badger))',
    ].join(' ');

    await this.octokit.rest.issues.createComment({
      owner: this.repo.owner,
      repo: this.repo.repo,
      issue_number: this.pullRequestNumber,
      body: comment,
    });
  }
}

interface RepositoryInfo {
  owner: string;
  repo: string;
}

function daysToDate(days: number): Date {
  const today = new Date();
  const earliestDate = new Date(new Date().setDate(today.getDate() - days));

  console.log(`Filtering search for pull requests with an earliest date of ${earliestDate.toISOString()}`);
  return earliestDate;
}

function beginsWithVowel(word: string) {
  return ['a', 'e', 'i', 'o', 'u'].includes(word[0]);
}
