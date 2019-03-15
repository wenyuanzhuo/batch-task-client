import { Observable } from "rxjs";

export interface BaseStory {
  sayName(): String;

  execute(): Observable<any>;
}
