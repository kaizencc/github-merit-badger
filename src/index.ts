import * as core from '@actions/core';

async function run() {
  console.log('hi');
  const token: string = core.getInput('github-token');
  console.log(token);
}

run().catch(error => {
  core.setFailed(error.message);
});