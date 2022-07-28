import * as core from '@actions/core';
import * as github from '@actions/github';

export interface IRepo {
  owner: string;
  repo: string;
}

export class GithubApi {
  private octokit;
  private repo: IRepo;
  private issueNumber: number | undefined;

  constructor(token: string) {
    this.octokit = github.getOctokit(token);
    this.repo = github.context.repo;

    if (github.context.payload.issue) {
      this.issueNumber = github.context.payload.issue.number;
    } else if (github.context.payload.pull_request) {
      this.issueNumber = github.context.payload.pull_request.number;
    } else {
      core.setFailed('Error retrieving issue number');
    }

  }

  public async setPullRequestLabels(labels: string[]) {
    if (!labels.length) return;
    if (this.issueNumber !== undefined) {
      await this.octokit.rest.issues.addLabels({
        owner: this.repo.owner,
        repo: this.repo.repo,
        issue_number: this.issueNumber,
        labels,
      });
    }
  }


  public async getIssueNumber() {
    return this.issueNumber;
  }

  public async getPullsData(page: number=1) {
    // head props can be used below to filter PRs based on title(no big change type)
    const response = await this.octokit.rest.pulls.list({
      owner: this.repo.owner,
      repo: this.repo.repo,
      state: 'all',
      per_page: 100,
      page: page,
    });
    return response.data;
  }

  public async getPulls() { // issueCreator: string) {
    let result = undefined;
    const issueCreator = await this.getIssueCreator().catch(error => {
      core.setFailed(error.message);
    });
    if (issueCreator !== undefined) {
      const issues = await this.octokit.paginate(this.octokit.rest.issues.listForRepo, {
        owner: this.repo.owner,
        repo: this.repo.repo,
        state: 'all',
        //q: `is:pr author:${issueCreator}`,
        creator: issueCreator,
      }).catch(error => {core.setFailed(error.message);});
      if (issues !== undefined) {
        result = issues.filter(isPull => isPull.pull_request);
      }
    }
    return result;
  }

  public async getMerges() {
    const pulls = await this.getPulls().catch(error => {core.setFailed(error.message);});
    if (pulls !== undefined) {
      return pulls.filter(isMerged => isMerged.pull_request?.merged_at);
      //const mergedPRs = pulls.filter(isMerged => isMerged.pull_request?.merged_at);
      //return mergedPRs.length;
    }
    return undefined;
    //console.log(`${issueCreator} has made ${numPRs} PRs`);
    //return numPRs;
  }

  public async getMergedTime(numOfDays: number) {

    let result = 0;
    const merges = await this.getMerges().catch(error => {core.setFailed(error.message);});
    if (merges !== undefined) {
      const mergeDates = merges.map(mergeDate => mergeDate.pull_request?.merged_at);
      if (mergeDates !== undefined) {
        //const mergedPRs = pulls.filter(isMerged => isMerged.pull_request?.merged_at);
        // return mergedPRs.length; (for testing purpose)
        // get target start date as "startDate" with the given days
        const daysAgo = new Date();
        //const daysAgo = new Date(date.getTime());
        daysAgo.setDate(daysAgo.getDate() - numOfDays);
        //const startDate = daysAgo;

        for (let i = 0; i < mergeDates.length; i += 1) {
          let date = mergeDates[i];
          if (date !== undefined && date !== null) {
            if ( (new Date(date).getDay() - daysAgo.getDay()) >= 0 ) {
              result = result + 1;
            }
          }
        }
      }
    }
    return result;
    //console.log(`${issueCreator} has made ${numPRs} PRs`);
    //return numPRs;
  }

  public async getIssueCreator() {
    if (this.issueNumber !== undefined) {
      const { data } = await this.octokit.rest.issues.get({
        owner: this.repo.owner,
        repo: this.repo.repo,
        issue_number: this.issueNumber,
      });
      return data.user?.login;
    } else {return undefined;}
  }

  public async writePRComments(comment: string) {
    if (this.issueNumber !== undefined) {
      await this.octokit.rest.issues.createComment({
        owner: this.repo.owner,
        repo: this.repo.repo,
        issue_number: this.issueNumber,
        body: comment,
      });
    }
  }

}
