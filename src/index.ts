import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { GithubApi } from './github';

async function run() {
  //console.log('hi');
  const token: string = core.getInput('github-token');
  //console.log(token);
  const labelsRaw: string = core.getInput('labels');
  const bucketsRaw: string = core.getInput('buckets');
  const meaningsRaw: string = core.getInput('label-meanings');
  //const category: string = core.getInput('category');

  //console.log(labelsRaw);
  //console.log(bucketsRaw);
  //console.log(category);


  // TODO: parse labels
  const labels: string[] = labelsRaw.split(',');

  // TODO: parse buckets
  const buckets: number[] = bucketsRaw.split(',').map(Number);

  // parse label meanings
  const meanings: string[] = meaningsRaw.split('|');

  // TODO: print all inputs
  //console.log(labels);
  //console.log(buckets);
  //console.log(category);
  console.log(meanings);

  //const dummyVal = 0;
  //const setLabels = determinLabels(labels, buckets, dummyVal);

  const github: GithubApi = new GithubApi(token);
  //console.log(github.getIssueNumber());

  const numPRs = await github.paginateData();
  console.log(numPRs);
  if (numPRs !== undefined) {
    console.log(numPRs);

    const index = determineIndex(buckets, numPRs);
    const setLabels = determinLabel(labels, index);

    if (setLabels != []) {
      console.log(setLabels);
      await github.setPullRequestLabels(setLabels).catch(error => {core.setFailed(error.message);}); // .catch(error => {core.setFailed(error.message);}); ?
    }

    // place to generste dynamic comments
    // it has user_name, labels and label meanings
    const dynamicComments = 'welcome' + github.getIssueCreator() + ', the CDK Team thanks you for being a' + setLabels + 'to the CDK. This means that you have made' + determineMeaning(meanings, index);

    if (dynamicComments !== undefined) {
      await github.writePRComments(dynamicComments).catch(error => {core.setFailed(error.message);});
    }
  }


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

}

run().catch(error => {
  core.setFailed(error.message);
});

function determinLabel(labels: string[], index: number) {
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
