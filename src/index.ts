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

  console.log(badges, badgeDescriptions, thresholds, badgeType, ignoreUsernames, days);

  if (badges.length === 0) {
    core.setFailed('must have at least one badge in the input');
    return;
  }

  if (badgeDescriptions.length !== badges.length || badges.length !== thresholds.length) {
    core.setFailed('badge, badgeDescriptions, and thresholds must be lists with the same number of elements');
    return;
  }

  let badger: Badger;
  if (badgeType === 'leaderboard') {
    badger = new LeaderboardBadger({
      token,
      badges,
      thresholds,
      badgeDescriptions,
      ignoreUsernames,
      days,
    });
  } else {
    badger = new AchievementBadger({
      token,
      badges,
      thresholds,
      badgeDescriptions,
      ignoreUsernames,
      days,
    });
  }

  await badger.runBadgerWorkflow();
}

//   const github: GithubApi = new GithubApi(token);

//   if (category === 'total') {
//     //const issues = await github.getPulls().catch(error => {core.setFailed(error.message);});
//     //if (issues !== undefined) {
//     const merges = await github.getMerges().catch(error => {core.setFailed(error.message);});
//     const numMerged = merges?.length;
//     console.log(numMerged);
//     if (numMerged !== undefined) {
//       //console.log(numMerged);

//       const index = determineIndex(buckets, numMerged);
//       const setLabels = determineLabel(labels, index);

//       if (setLabels != []) {
//         console.log(setLabels);
//         await github.setPullRequestLabels(setLabels).catch(error => {core.setFailed(error.message);}); // .catch(error => {core.setFailed(error.message);}); ?
//       }

//       // place to generste dynamic comments
//       // it has user_name, labels and label meanings
//       if (index !== -1) {
//         const dynamicComments = '<!--contribute badge-->' + 'Welcome ' + await github.getIssueCreator().catch(error => {core.setFailed(error.message);}) + ', the CDK Team thanks you for opening a pull request. You got the \'' + setLabels[0] + '\' label. ' + determineMeaning(meanings, index);
//         const searchWords = /<!--contribute badge-->/;
//         //console.log(dynamicComments);
//         //console.log(github.writePRComments(dynamicComments, searchWords));
//         if (dynamicComments !== undefined) {
//           await github.writePRComments(dynamicComments, searchWords).catch(error => {core.setFailed(error.message);});
//         }
//       }
//     }
//     //}


//     //const data = await github.getPullsData().catch(error => {
//     //  core.setFailed(error.message);
//     //});

//     //console.log(data);

//     //if (data !== undefined) { // if (result instanceof Object) {
//     //  for (let i = 0; i < data.length; i += 1) {
//     //    console.log(data[i].user?.login);
//     //  }
//     //}

//     //console.log('\nReset\n');

//     /*const creator = await github.getIssueCreator().catch(error => {
//       core.setFailed(error.message);
//     });
//     */

//     //if (creator !== undefined) {
//     //await github.paginateData().catch(error => {
//     //  core.setFailed(error.message);
//     //});
//     //}

//     //console.log(github.context.issue.owner);
//     //const content = github.
//   } else if (category === 'hotlist') {
//     const days: number = Number(core.getInput('days'));
//     // call different functions from github
//     // alternatively, can determine labels + comment and do setting in 1 step
//     // also consider editing comment as a strech goal
//     const recentMerges = await github.getRecentMerges(days, false).catch(error => {core.setFailed(error.message);});

//     if (recentMerges !== undefined) {
//       const usernames = recentMerges.filter(hasLogin => hasLogin.user?.login).map(login => login.user?.login);
//       console.log(usernames);

//       if (usernames !== undefined) {
//         const hotlist = getHotlist(usernames);

//         if (hotlist !== undefined) {
//           const minHeap = new Heap(compareFunction);
//           minHeap.init(hotlist);

//           const creator = await github.getIssueCreator().catch(error => {core.setFailed(error.message);});

//           if (creator !== undefined) {
//             const index = determineHotIndex(buckets, creator, minHeap);

//             if (index !== -1) {
//               const setLabels = determineLabel(labels, index);

//               if (setLabels != []) {
//                 console.log(setLabels);
//                 await github.setPullRequestLabels(setLabels).catch(error => {core.setFailed(error.message);}); // .catch(error => {core.setFailed(error.message);}); ?

//                 let hotlistComment = 'You got the \'' + setLabels[0] + '\' label. This label means you are on the hotlist! ' + meanings[index];

//                 await github.writePRComments(hotlistComment).catch(error => {core.setFailed(error.message);});
//               }
//             }
//           }
//         }
//       }
//     }


//   } else {
//     // do nothing
//   }
// }

// run().catch(error => {
//   core.setFailed(error.message);
// });

// function determineLabel(labels: string[], index: number) {
//   if (index === -1) {
//     return [];
//   }
//   return [labels[index]];
// }


// function determineMeaning(meanings: string[], index: number) {
//   if (index === -1) {
//     return undefined;
//   }
//   return meanings[index];
// }


// function determineIndex(buckets: number[], value: number): number {
//   if (value <= buckets[0]) {
//     return -1;
//   }
//   let index = 0;

//   let i = 0;
//   while (i < buckets.length) {
//     if (value > buckets[i]) {
//       index = i;
//     }
//     if (value <= buckets[i]) {
//       break;
//     }
//     i += 1;
//   }
//   return index;
// }


// export function determineHotIndex(buckets: number[], key: string, heap: Heap<(string | number)[]>) {
//   //console.log(buckets, key, heap);
//   let index = 0;
//   for (let i = 0; i < buckets.length; i += 1) {
//     for (let j = 0; j < buckets[i]; j += 1) {
//       let pop = heap.pop();
//       console.log(pop);
//       if (pop !== undefined) {
//         if (key === pop[0]) {
//           return index;
//         }
//       } else {
//         return -1;
//       }
//     }
//     index += 1;
//   }
//   return -1;
// }


// export function getHotlist(usernames: (string | undefined)[]) {
//   let hotlist: Map<string, number> = new Map<string, number>;
//   for (let i = 0; i < usernames.length; i += 1) {
//     let username = usernames[i];
//     if (username !== undefined) {
//       if (hotlist.has(username)) {
//         let value = hotlist.get(username);
//         if (value !== undefined) {
//           hotlist.set(username, value + 1);
//         }
//       } else {
//         hotlist.set(username, 1);
//       }
//     } else {
//       return undefined;
//     }
//   }
//   return Array.from(hotlist);
// }

// export function compareFunction(a: (string | number)[], b: (string | number)[]) {
//   return a[1] >= b[1] ? -1 : 1;
// }

/**
 * Renders a TypeScript list based on what we expect the list to look like in yaml.
 * We expect to see something like "[item1,item2]". GitHub will return '' if the
 * input is not defined, so treating the empty string like undefined.
 */
function renderListInput(rawInput: string): string[] {
  return (rawInput === '' || rawInput === '[]') ? [] : rawInput.replace(/\[|\]/gi, '').split(',');
}

function toNumberList(list: string[]): number[] {
  return list.map((i) => Number(i));
}

run().catch(error => {
  core.setFailed(error.message);
});
