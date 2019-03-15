export class Logger {
  log(msg: any)   { console.log(msg); }
  info(msg: any)   { console.log(msg); }
  error(msg: any) { console.error(msg); }
  warn(msg: any)  { console.warn(msg); }
}

export const logger = new Logger()
