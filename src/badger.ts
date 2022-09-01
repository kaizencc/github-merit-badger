import * as core from '@actions/core';
import * as github from '@actions/github';

const BADGER_METADATA = '<!--merit badge comment-->';

export interface BadgerProps {
  readonly days?: number;
  readonly token: string;
  readonly badges: string[];
  readonly badgeDescriptions: string[];
  readonly thresholds: number[];
  readonly ignoreUsernames: string[];
}

interface BadgeInfo {
  readonly name: string;
  readonly description: string;
  readonly threshold: number;
}

export abstract class Badger {
  private octokit;
  private repo: RepositoryInfo;
  private pullRequestNumber: number;
  private timestamp?: string;
  private ignoreUsernames?: string[];
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

    this.timestamp = props.days ? daysToTimestamp(props.days) : undefined;
    this.ignoreUsernames = props.ignoreUsernames;

    for (let i = 0; i < props.badges.length; i++) {
      this.badges.push({
        name: props.badges[i],
        description: props.badgeDescriptions[i],
        threshold: props.thresholds[i],
      });
    }
  }

  public abstract runBadgerWorkflow(): Promise<void>;

  public abstract determineBadge(pullRequests: any[]): number;

  protected ignoreThisUsername(username: string) {
    return this.ignoreUsernames?.includes(username);
  }

  protected async getGitHubUsername() {
    const { data } = await this.octokit.rest.issues.get({
      owner: this.repo.owner,
      repo: this.repo.repo,
      issue_number: this.pullRequestNumber,
    });

    const user = data.user?.login;

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
      since: this.timestamp,
      creator: username,
    }).catch(error => {
      core.setFailed(error.message);
    });

    if (!issues) {
      console.log('no pull requests found');
      return [];
    }

    console.log(JSON.stringify(issues));

    return issues.filter(isMerged => isMerged.pull_request?.merged_at);
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

function daysToTimestamp(days: number) {
  const today = new Date();
  const earliestDate = new Date(new Date().setDate(today.getDate() - days));

  console.log(`Filtering search for pull requests with an earliest date of ${earliestDate.toISOString()}`);
  return earliestDate.toISOString();
}

function beginsWithVowel(word: string) {
  return ['a', 'e', 'i', 'o', 'u'].includes(word[0]);
}