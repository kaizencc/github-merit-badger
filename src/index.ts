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
  console.log(category);


  // TODO: parse labels

  // TODO: parse buckets

  // TODO: print all inputs
}

run().catch(error => {
  core.setFailed(error.message);
});