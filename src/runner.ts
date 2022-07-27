import * as handle from './md';


const file = 'test.md';
const handler = new handle.handleFileActions(file);

handler.createTable(['Contributor', 'Total PRs', 'Merged contributions in last 30 days']);


handler.addContributor({ login: 'parker', total: 123, recent: 54 });
handler.addContributor({ login: 'abc', total: 999, recent: 99 });

handler.editRow('parker', { login: 'parker', total: 125, recent: 134512389472 }, [true, true, false]);
