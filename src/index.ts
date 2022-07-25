import * as core from '@actions/core';

async function run() {
  console.log('hi');
}

run().catch(error => {
  core.setFailed(error.message);
});