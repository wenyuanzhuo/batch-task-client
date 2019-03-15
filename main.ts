import { from } from 'rxjs'
import chalk from 'chalk'
import * as path from 'path'
import * as fs from 'fs'
import { logger } from './lib/services/logger'
import playbook from './lib/playbook'

function main() {
  var appPath = path.resolve('./app.json')
  if (!fs.existsSync(appPath)) {
    logger.error('找不到配置文件 app.json')
    return Promise.resolve(1)
  }

  const story = playbook.storyTeller.tell(process.argv)
  if (!story) {
    logger.info(chalk.red(`> Command Not Found!`))
    process.exit(1)
  }
  story.execute().subscribe(
    result => {
      logger.info(chalk.magenta(`[${story.sayName()}]`) + ` success.`)
    },
    err => {
      logger.info(chalk.red(err.message))
      logger.error(err)
    },
    () => {
      logger.info('story completed.')
      process.exit(0)
    }
  )
}

main()
