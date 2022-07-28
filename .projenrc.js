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
      'label-meanings': {
        description: 'used in automated comment to explain the label',
        required: true,
      },
      'days': {
        description: 'filter for pull requests in the last days number of days',
        required: false,
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