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
export default class DropStory implements BaseStory {

  sayName(): String {
    return 'Drop Story';
  }

  readLocal(): Promise<any> {
    const files = fs.readdirSync(resourcePath)
    let pageFiles = files.filter(item => {
      const fullPath = path.join(resourcePath, item)
      if (item.endsWith('.json') && fs.statSync(fullPath).isFile()) {
        return true
      }
      return false
    }).map(item => {
      const fullPath = path.join(resourcePath, item)
      const content = fs.readFileSync(fullPath, 'utf-8')
      const fileObj = JSON.parse(content)
      return {
        id: fileObj['page_id'],
        file: item,
        path: fullPath,
        content: fileObj,
      }
    })

    return Promise.resolve({
      list: pageFiles,
    });
  }

  askPage(localPage): Promise<any> {
    const pageList = localPage.list
    const pageIds = pageList.map(item => item.id)
    if (!pageList.length) {
      return Promise.reject(new Error('没有找到任何配置'));
    }

    const pageMap = pageList.reduce((result, current) => {
      result[current.id] = current
      return result
    }, {})

    return reader.readlinePromise([
      chalk.gray('> Choose Page From '),
      '[',
      chalk.green(`${pageIds.join(',')}`),
      ']:',
    ].join(' ')).then(pageId => {
      if (!pageMap[`${pageId}`]) {
        throw new Error('没有选择任何配置文件')
      }

      return {
        page: pageId,
        pageIds: pageIds,
        file: pageMap[`${pageId}`],
      }
    })
  }

  checkPage(pageMetaData): Promise<any> {
    return Promise.resolve(1)
  }

  buildPage(pageMetaData): Promise<any> {
    return Promise.resolve(1)
  }

  execute(): Observable<any> {
    return of(Promise.resolve(logger.info([
      '>', 'Starting Load Local Config!'
    ].join(' '))))
      .pipe(concatMap(this.readLocal))
      .pipe(concatMap(this.askPage))
      .pipe(concatMap(this.checkPage))
      .pipe(concatMap(this.buildPage))
  }
}
