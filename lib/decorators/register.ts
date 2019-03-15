import { logger } from '../services/logger'

export function StoryRegister<T extends { new(...args: any[]): {} }>(constructor: T) {

  return class extends constructor {
    book = [];
    mark: Boolean;

    readMenu(book) {
      this.book = Object.keys(book);
      if (this.mark !== true) {
        return
      }
      console.log(this.book)
    }
  }
}
