import { BaseStory } from './base';
import { Observable, zip, of } from 'rxjs';
import { concatMap } from 'rxjs/operators'
import { logger } from '../services/logger'
import { StoryRegister } from '../decorators/register'
import * as reader from '../services/reader'
import { appConfig } from '../config/global'
import chalk from 'chalk'
import * as path from 'path'
import * as fs from 'fs'

const resourcePath = path.resolve('./resources/')

@StoryRegister
export default class SuccessStory implements BaseStory {

  sayName(): String {
    return 'Success Story';
  }

  readFile(): Promise<any> {
    return Promise.resolve({
      status: false,
    });
  }


  execute(): Observable<any> {
    const filePath = path.resolve('resources/data.json')
    if (!fs.existsSync(filePath)) {
      throw new Error('找不到数据文件')
    }
    const str = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(str)
    data.source = []

    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8')
    return of(Promise.resolve(logger.info([
      '>', 'Starting Loading...'
    ].join(' '))))
      .pipe(concatMap(this.readFile))
  }
}
