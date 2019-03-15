import FailStory from "./story/fail";
import DropStory from "./story/drop";
import SuccessStory from "./story/success";
import HelpStory from "./story/help";
import { BaseStory } from './story/base';

const book = {
  fail: new FailStory(),
  success: new SuccessStory(),
  drop: new DropStory(),
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
