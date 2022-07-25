const { GitHubActionTypeScriptProject } = require('projen-github-action-typescript');
const project = new GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  devDeps: ['projen-github-action-typescript'],
  name: 'intern-hackathon',
  actionMetadata: {
    inputs: {
      'github-token': {
        description: 'github token',
        required: true,
      },
      'labels': {
        description: 'posible labels',
        required: true,
      },
      'buckets': {
        description: 'bands corresponding 1-1 with labels',
        required: true,
      },
      'category': {
        description: 'category that buckets pertains to',
        required: true,
      },
    },
  },
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();