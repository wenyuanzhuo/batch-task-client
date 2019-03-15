import { BaseStory } from './base';
import { Observable, zip, of } from 'rxjs';
import { concatMap } from 'rxjs/operators'
import { logger } from '../services/logger'
import { StoryRegister } from '../decorators/register'
import * as reader from '../services/reader'
import { appConfig } from '../config/global'
import { setPresaleOrderStatusApi } from '../api/server.api'
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
    const dataPath = path.resolve('./data.json')
    const content = fs.readFileSync(dataPath, 'utf-8')
    const fileObj = JSON.parse(content)
    const { list = [] } = fileObj || {}
    return Promise.resolve(list)
  }

  setPresaleOrderStatus(list): Promise<any> {
    if (!list || !list.length) {
      return Promise.reject(new Error('没有找到任何配置'))
    }

    const resultList = []

    const setRequestList = (list) => {
      return list.map(item => {
        return () => setPresaleOrderStatusApi(item.id)
      })
    }

    const batchSet = (list) => {
      return Promise.all(setRequestList(list)).then(dropPresaleList => {
        console.log('ss...1')
        // filter
        const successList = [9090,2100]
        const failList = []
        successList.length && resultList.concat(successList)
        if (failList.length) {
          batchSet(failList)
          return
        }
        console.log('sss....2')
        return Promise.resolve({ resultList })
      })
    }
    
    return batchSet(list)
  }

  execute(): Observable<any> {
    return of(Promise.resolve(logger.info([
      '>', 'Starting Load Local Config!'
    ].join(' '))))
      .pipe(concatMap(this.readFile))
      .pipe(concatMap(this.setPresaleOrderStatus))
  }
}
