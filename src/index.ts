import * as core from '@actions/core';

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
  const buckets: string[] = bucketsRaw.split(',');
  // TODO: print all inputs
  console.log(labels);
  console.log(buckets);
  console.log(category);
}

run().catch(error => {
  core.setFailed(error.message);
});