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
    const dataPath = path.resolve('./resources/data.json')
    const content = fs.readFileSync(dataPath, 'utf-8')
    const fileObj = JSON.parse(content)
    const { source = [] } = fileObj || {}
    return Promise.resolve(source)
  }

  setPresaleOrderStatus(list): Promise<any> {
    if (!list || !list.length) {
      return Promise.reject(new Error('没有找到任何配置'))
    }

    let resultObj = {}

    const setRequestList = (list) => {
      return list.map(item => {
        return setPresaleOrderStatusApi(item.order_id).toPromise().then(res => {
          return res
        })
      })
    }

    const batchSet = (list) => {
      return Promise.all(setRequestList(list)).then(dropPresaleList => {

        const successList = dropPresaleList.filter((item: any) => {
          return item && item.status === 0 && item.data
        })
        const failList = dropPresaleList.filter((item: any) => {
          return item && item.status !== 0 || !item.data
        })

        resultObj = successList.reduce((result, item: any) => {
          const { order_id } = item.data
          result[order_id] = {
            "source": { "order_id": order_id },
            "setStatus": true,
            "refundStatus": false,
            "successStatus": false
          }

          return result
        }, resultObj)

        if (failList.length) {
          console.error(`有${failList.length}条订单设置失败！`)
          // batchSet(failList)
          // return
        }
  
        const newPath = path.resolve('./resources/data.json')
        fs.writeFileSync(newPath, JSON.stringify(resultObj), 'utf-8')
        return Promise.resolve({ resultObj })
      })
    }
    
    return batchSet(list)
  }

  execute(): Observable<any> {
    return of(Promise.resolve(logger.info([
      '>', 'Starting Load Source Fail!'
    ].join(' '))))
      .pipe(concatMap(this.readFile))
      .pipe(concatMap(this.setPresaleOrderStatus))
  }
}
