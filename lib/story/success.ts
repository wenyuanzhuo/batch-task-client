import { BaseStory } from './base';
import { Observable, zip, of } from 'rxjs';
import { concatMap } from 'rxjs/operators'
import { logger } from '../services/logger'
import { StoryRegister } from '../decorators/register'
import * as serverApi from '../api/server.api'
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
    const filePath = path.resolve('resources/data.json')
    if (!fs.existsSync(filePath)) {
      throw new Error('找不到数据文件')
    }

    const str = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(str)
    return Promise.resolve({ data, filePath });
  }

  setSuccess({ data, filePath }): Promise<any> {
    const { source = [] } = data
    const arr = []
    console.log(source, '-----')
    source.forEach(item => {
      const { order_id } = item
      arr.push(serverApi.queryPresaleOrderStatus(order_id).toPromise())
    });
    Promise.all(arr).then((results) => {
      console.log(results, '===')
      for(const item in results) {
        const orderId = results[item].order_id
        const res = results[item]
        console.log(res)
        if(res.order_id && res.order_id === orderId && data.process[res.order_id].refundStatus && data.process[res.order_id].setStatus) {
          serverApi.setPresaleDropSuccess(res.order_id)
          data.process[res.order_id].successStatus = true
          fs.writeFileSync(filePath, JSON.stringify(data), 'utf8')
        }
      }
    })
    return Promise.resolve(true)
  }
  execute(): Observable<any> {
    return of(Promise.resolve(logger.info([
      '>', 'Starting Loading...'
    ].join(' '))))
      .pipe(concatMap(this.readFile))
      .pipe(concatMap(this.setSuccess))
  }
}
