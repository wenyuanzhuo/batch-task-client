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

const filePath = path.resolve('resources/data.json')

@StoryRegister
export default class DropStory implements BaseStory {

  sayName(): String {
    return 'Drop Story';
  }

  readFile(): Promise<any> {
    if (!fs.existsSync(filePath)) {
      throw new Error('找不到数据文件')
    }
    const str = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(str)

    return Promise.resolve(data);
  }

  checkOrder(loadData: any): Promise<any> {
    const checkedOrderData = {}
    const parallelRequests = []
    const orderIds = []
    for (let orderId in loadData.process) {
      orderIds.push(orderId)
      const orderData = loadData.process[orderId]

      parallelRequests.push(serverApi.queryPresaleOrderStatus(orderId).toPromise())
    }

    return Promise.all(parallelRequests).then(parallelResults => {
      for (let i in parallelResults) {
        let orderId = orderIds[i]
        let responseData = parallelResults[i]

        if (responseData.status === 0 && responseData.data && responseData.data.order_id === orderId) {
          checkedOrderData[orderId] = responseData.data
        }
      }
      return {
        storage: loadData,
        checked: checkedOrderData,
      }
    })
  }

  runBatch(localMemory): Promise<any> {
    const loadData = localMemory.storage
    const checkedData = localMemory.checked
    const orderIds = []

    const parallelRequests = []
    for (let orderId in checkedData) {
      orderIds.push(orderId)
      const orderData = checkedData[orderId]
      const currentTask = Promise.resolve(new Promise((resolve, reject) => {
        pingpp.charges.retrieve(
          orderData.serial,
          function (err, charge) {
            if (err) {
              resolve(null)
              return
            }
            resolve(charge)
          }
        );
      })).then((chargeInfo: any) => {
        if (!chargeInfo) {
          return false
        } else if (chargeInfo.refunded) {
          return true
        }

        return true
        return new Promise((resolve, reject) => {
          pingpp.charges.createRefund(
            orderData.serial,
            { description: `order_id:${orderId}` },
            function (err, charge) {
              if (err) {
                resolve(false)
                return
              }
              resolve(true)
            }
          );
        })
      })
      parallelRequests.push(currentTask)
    }

    return Promise.all(parallelRequests).then(parallelResults => {
      for (let i in parallelResults) {
        const orderId = orderIds[i]
        if (parallelResults[i] === true) {
          loadData.process[orderId].refundStatus = true
        }
      }

      return loadData
    })
  }

  saveData(loadData): Promise<any> {
    fs.writeFileSync(filePath, JSON.stringify(loadData), 'utf-8')
    return Promise.resolve(loadData)
  }

  review(loadData): Promise<any> {
    const total = loadData.source.length
    let settingCount = 0
    let refundCount = 0
    let successCount = 0

    for (let orderId in loadData.process) {
      const orderData = loadData.process[orderId]
      if (orderData.setStatus) {
        settingCount++
      }

      if (orderData.refundStatus) {
        refundCount++
      }

      if (orderData.successStatus) {
        successCount++
      }
    }

    logger.info([
      'Refund Summary: ',
      chalk.green(`total: ${total}`),
      chalk.yellow(`set: ${settingCount}`),
      chalk.blue(`refund: ${refundCount}`),
      `success: ${successCount}`,
    ].join(' '))
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
      .pipe(concatMap(this.review))
  }
}
