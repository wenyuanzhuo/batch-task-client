import * as readline from 'readline'
// import chalk from 'chalk'

export function readlinePromise(question) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(question, (answer) => {
      // TODO: Log the answer in a database
      // console.log(`Thank you for your valuable feedback: ${answer}`)
      resolve(answer)

      rl.close()
    })
  })
}
