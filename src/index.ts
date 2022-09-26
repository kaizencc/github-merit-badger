import * as core from '@actions/core';
// import { Heap } from 'heap-js';
import { AchievementBadger } from './achievement-badger';
import { Badger } from './badger';
import { LeaderboardBadger } from './leaderboard-badger';

async function run() {
  const token: string = core.getInput('github-token');
  const badges: string[] = renderListInput(core.getInput('badges'));
  const thresholds: number[] = toNumberList(renderListInput(core.getInput('thresholds')));
  const badgeDescriptions: string[] = renderListInput(core.getInput('badge-descriptions'));
  const badgeType: string = core.getInput('badge-type');
  const ignoreUsernames: string[] = renderListInput(core.getInput('ignore-usernames'));
  const days = Number(core.getInput('days'));
  const prefixes = renderListInput(core.getInput('title-prefixes'));

  console.log(badges, badgeDescriptions, thresholds, badgeType, ignoreUsernames, days, prefixes);

  if (badges.length === 0) {
    core.setFailed('must have at least one badge in the input');
    return;
  }

  if (badges.length !== thresholds.length || (badgeDescriptions.length > 0 && badgeDescriptions.length !== badges.length)) {
    core.setFailed('badge, badgeDescriptions, and thresholds must be lists with the same number of elements');
    return;
  }

  let badger: Badger;
  if (badgeType === 'leaderboard') {
    badger = new LeaderboardBadger({
      token,
      badges,
      thresholds,
      badgeDescriptions: badgeDescriptions.length === 0 ? undefined : badgeDescriptions,
      ignoreUsernames,
      days,
      prefixes,
    });
  } else {
    badger = new AchievementBadger({
      token,
      badges,
      thresholds,
      badgeDescriptions: badgeDescriptions.length === 0 ? undefined : badgeDescriptions,
      ignoreUsernames,
      days,
      prefixes,
    });
  }

  await badger.runBadgerWorkflow();
}

/**
 * Renders a TypeScript list based on what we expect the list to look like in yaml.
 * We expect to see something like "[item1,item2]". GitHub will return '' if the
 * input is not defined, so treating the empty string like undefined.
 */
function renderListInput(rawInput: string): string[] {
  return (rawInput === '' || rawInput === '[]') ? [] : rawInput.slice(1, -1).split(',');
}

function toNumberList(list: string[]): number[] {
  return list.map((i) => Number(i));
}

run().catch(error => {
  core.setFailed(error.message);
});
