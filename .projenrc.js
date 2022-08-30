const { GitHubActionTypeScriptProject } = require('projen-github-action-typescript');
const project = new GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  devDeps: ['projen-github-action-typescript'],
  deps: ['heap-js'],
  name: 'github-merit-badges',
  actionMetadata: {
    inputs: {
      'github-token': {
        description: 'github token',
        required: true,
      },
      'badges': {
        description: 'badge names corresponding 1-1 with thresholds',
        required: true,
      },
      'badge-descriptions': {
        description: 'badge descriptions corresponding 1-1 with badges',
        required: true,
      },
      'thresholds': {
        description: 'thresholds corresponding 1-1 with badges',
        required: true,
      },
      'days': {
        description: 'filter for pull requests merged in the last X number of days',
        required: false,
      },
      'ignore': {
        description: 'ignore pull requests from these authors',
        required: false,
      },
      'badge-type': {
        description: 'a flag for different ways of measuring contributions',
        default: 'total',
        required: false,
      },
    },
  },
});
project.synth();