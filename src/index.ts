import * as core from '@actions/core';
//import { GitHub } from '@actions/github/lib/utils';
import { GithubApi } from './github';

async function run() {

  const token: string = core.getInput('github-token');
  const labelsRaw: string = core.getInput('labels');
  const bucketsRaw: string = core.getInput('buckets');
  const meaningsRaw: string = core.getInput('label-meanings');
  const category: string = core.getInput('category');

  // parse labels
  const labels: string[] = labelsRaw.split(',');

  // parse buckets
  const buckets: number[] = bucketsRaw.split(',').map(Number);

  // parse label meanings
  const meanings: string[] = meaningsRaw.split('|');

  const github: GithubApi = new GithubApi(token);

  if (category === 'total') {
    //const issues = await github.getPulls().catch(error => {core.setFailed(error.message);});
    //if (issues !== undefined) {
    const merges = await github.getMerges().catch(error => {core.setFailed(error.message);});
    const numMerged = merges?.length;
    console.log(numMerged);
    if (numMerged !== undefined) {
      console.log(numMerged);

      const index = determineIndex(buckets, numMerged);
      const setLabels = determineLabel(labels, index);

      if (setLabels != []) {
        console.log(setLabels);
        await github.setPullRequestLabels(setLabels).catch(error => {core.setFailed(error.message);}); // .catch(error => {core.setFailed(error.message);}); ?
      }

      // place to generste dynamic comments
      // it has user_name, labels and label meanings
      const dynamicComments = 'welcome ' + await github.getIssueCreator().catch(error => {core.setFailed(error.message);}) + ', the CDK Team thanks you for being a ' + setLabels + ' to the CDK. This means that you have made ' + determineMeaning(meanings, index);
      //console.log(dynamicComments);
      if (dynamicComments !== undefined) {
        await github.writePRComments(dynamicComments).catch(error => {core.setFailed(error.message);});
      }
    }
    //}


    //const data = await github.getPullsData().catch(error => {
    //  core.setFailed(error.message);
    //});

    //console.log(data);

    //if (data !== undefined) { // if (result instanceof Object) {
    //  for (let i = 0; i < data.length; i += 1) {
    //    console.log(data[i].user?.login);
    //  }
    //}

    //console.log('\nReset\n');

    /*const creator = await github.getIssueCreator().catch(error => {
      core.setFailed(error.message);
    });
    */

    //if (creator !== undefined) {
    //await github.paginateData().catch(error => {
    //  core.setFailed(error.message);
    //});
    //}

    //console.log(github.context.issue.owner);
    //const content = github.
  } else if (category === 'hotlist') {
    const days: number = Number(core.getInput('days'));
    // call different functions from github
    // alternatively, can determine labels + comment and do setting in 1 step
    // also consider editing comment as a strech goal
    const recentMerges = await github.getRecentMerges(days, false).catch(error => {core.setFailed(error.message);});
    console.log(recentMerges);

    if (recentMerges !== undefined) {
      const usernames = recentMerges.filter(hasLogin => hasLogin.user?.login).map(login => login.user?.login);
      console.log(usernames);
      //const hotlist = getHotlist(usernames);
    }


  } else {
    // do nothing
  }
}

run().catch(error => {
  core.setFailed(error.message);
});

function determineLabel(labels: string[], index: number) {
  if (index === -1) {
    return [];
  }
  return [labels[index]];
}


function determineMeaning(meanings: string[], index: number) {
  if (index === -1) {
    return undefined;
  }
  return meanings[index];
}


function determineIndex(buckets: number[], value: number): number {
  if (value <= buckets[0]) {
    return -1;
  }
  let index = 0;

  let i = 0;
  while (i < buckets.length) {
    if (value > buckets[i]) {
      index = i;
    }
    if (value <= buckets[i]) {
      break;
    }
    i += 1;
  }
  return index;
}


