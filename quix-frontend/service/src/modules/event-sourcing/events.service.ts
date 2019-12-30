import {Injectable} from '@nestjs/common';
import {IAction} from './infrastructure/types';
import {IGoogleUser} from 'modules/auth/types';

@Injectable()
export class EventsService {
  eventLog: {[id: string]: IAction[]} = {};

  logEvent(action: IAction) {
    const email = action.user;
    if (!this.eventLog[email]) {
      this.eventLog[email] = [];
    }
    this.eventLog[email].push(action);
  }

  getEvents(email: string): IAction[] {
    return this.eventLog[email];
  }
}
