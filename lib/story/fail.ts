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
export default class FailStory implements BaseStory {

  sayName(): String {
    return 'Fail Story';
  }

  readFile(): Promise<any> {
    return Promise.resolve({
      status: false,
    });
  }


  execute(): Observable<any> {
    return of(Promise.resolve(logger.info([
      '>', 'Starting Load Local Config!'
    ].join(' '))))
      .pipe(concatMap(this.readFile))
  }
}
