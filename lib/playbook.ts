import FailStory from "./story/fail";
import DropStory from "./story/drop";
import HelpStory from "./story/help";
import { BaseStory } from './story/base';

const book = {
  fail: new FailStory(),
  help: new HelpStory(),
}

class StoryTeller {
  book = null;

  constructor(book) {
    this.book = book
  }

  tell(rawArgv: Array<string>): BaseStory {
    const argvParams = rawArgv.slice(2)

    let storyName = argvParams[0]
    if (!this.book[storyName]) {
      storyName = 'help'
    }
    const activeStory = this.book[storyName];

    activeStory.readMenu(this.book);
    return activeStory;
  }
}

export default {
  storyTeller: new StoryTeller(book),
}
