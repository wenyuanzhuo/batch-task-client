import { BaseStory } from './base';
import { Observable, zip, of } from 'rxjs';
import { concatMap } from 'rxjs/operators'
import { logger } from '../services/logger'
import { StoryRegister } from '../decorators/register'
import * as serverApi from '../api/server.api'
import * as reader from '../services/reader'
import { appConfig, pingppPrivateKey } from '../config/global'
import chalk from 'chalk'
import * as path from 'path'
import * as fs from 'fs'

var pingpp = require('pingpp')(appConfig.pingppSecretKey);
pingpp.setPrivateKey(pingppPrivateKey);

const resourcePath = path.resolve('./resources/')

@StoryRegister
export default class DropStory implements BaseStory {

  sayName(): String {
    return 'Drop Story';
  }

  readFile(): Promise<any> {
    const filePath = path.resolve('resources/data.json')
    if (!fs.existsSync(filePath)) {
      throw new Error('找不到数据文件')
    }
    const str = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(str)

    return Promise.resolve(data);
  }

  checkOrder(loadData): Promise<any> {
    console.log(chalk.blue(loadData.source.length))
    return Promise.resolve({
      storage: loadData,
      checked: {},
    })
  }

  runBatch(loadData): Promise<any> {

    return new Promise((resolve, reject) => {
      pingpp.charges.retrieve(
        "ch_GizHmD9KKaT450CGyPzbfTW9",
        function(err, charge) {
          // YOUR CODE
          console.log(err, charge)
          resolve(loadData)
        }
      );
    })
  }

  saveData(loadData): Promise<any> {
    return Promise.resolve(1)
  }

  execute(): Observable<any> {
    return of(Promise.resolve(logger.info([
      '>',
      chalk.cyan('[DROP]'),
      'Starting Load Data File!',
    ].join(' '))))
      .pipe(concatMap(this.readFile))
      .pipe(concatMap(this.checkOrder))
      .pipe(concatMap(this.runBatch))
      .pipe(concatMap(this.saveData))
  }
}
