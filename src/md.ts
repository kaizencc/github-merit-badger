import * as fs from 'fs';
//const events = require('events');
import * as readline from 'readline';

export interface IContributor {
  login: string;
  total: number;
  recent: number;
}

export class handleFileActions {

  private file: string;
  constructor(file: string) {
    this.file = file;
  }

  public createTable(headers: string[]) {
    let head = '';
    let border = '';
    for (let i = 0; i < headers.length; i += 1) {
      head = head.concat(headers[i].toString());
      border = border.concat('-');
      if (i !== headers.length - 1) {
        head = head.concat('|');
        border = border.concat('|');
      } else {
        head = head.concat('\n');
        border = border.concat('\n');
      }
    }
    head = head.concat(border);
    fs.writeFileSync(this.file, head);
  }

  public addContributor(contributor: IContributor) {
    const line = contributor.login + '|' + contributor.total + '|' + contributor.recent + '\n';

    fs.appendFileSync(this.file, line);
  }

  // login specifies the row to edit, if a flag is false then that attribute will not be edited
  public editRow(login: string, data: IContributor, flags: boolean[]=[true, true, true]) {
    let result = '';

    // TODO: get file, loop through lines 3-end looking for a match for login
    const rl = readline.createInterface({
      input: fs.createReadStream(this.file),
    });

    let lineNum = 1;
    rl.on('line', function (input: string) {
      console.log('This is the text: ' + input);
      if (lineNum > 2) {
        if (login === input.slice(0, login.length)) {
          console.log('Yes');
          result += input;
        } else {
          console.log('No');
          result += input + 'yolo\n';
        }
      } else {
        lineNum += 1;
      }
      console.log('do this first: ' + result);
    });
    console.log('do this last: ' + result);
    console.log('' + data + flags);
    // TODO: while on a row that does not match, write it back

    // TODO: on the matching row, write in new data
    // TODO: if a flag is set to false, do not overwrite


  }
}


