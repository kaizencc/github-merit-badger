import * as core from '@actions/core';
import { GithubApi } from './github';

async function run() {
  console.log('hi');
  const token: string = core.getInput('github-token');
  console.log(token);
  const labelsRaw: string = core.getInput('labels');
  const bucketsRaw: string = core.getInput('buckets');
  const category: string = core.getInput('category');

  console.log(labelsRaw);
  console.log(bucketsRaw);
  //console.log(category);


  // TODO: parse labels
  const labels: string[] = labelsRaw.split(',');

  // TODO: parse buckets
  const buckets: number[] = bucketsRaw.split(',').map(Number);
  // TODO: print all inputs
  console.log(labels);
  console.log(buckets);
  console.log(category);

  const dummyVal = 0;
  const setLabels = determinLabels(labels, buckets, dummyVal);

  const github: GithubApi = new GithubApi(token);
  console.log(github.getIssueNumber());

  if (setLabels != []) {
    await github.setPullRequestLabels(setLabels).catch(error => {core.setFailed(error.message);}); // .catch(error => {core.setFailed(error.message);}); ?
  }

  const data = await github.getPullsData().catch(error => {
    core.setFailed(error.message);
  });

  console.log(data);

  if (data !== undefined) { // if (result instanceof Object) {
    for (let i = 0; i < data.length; ) {
      console.log(data[i].user?.login);
    }
  }

}

run().catch(error => {
  core.setFailed(error.message);
});

function determinLabels(labels: string[], buckets: number[], value: number) {
  if (value <= buckets[0]) {
    return [];
  }
  let index = 0;
  let result = [];

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

  result.push(labels[index]);
  return result;
}
