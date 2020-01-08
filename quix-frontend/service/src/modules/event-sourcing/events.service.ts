import {Injectable} from '@nestjs/common';
import {IAction} from './infrastructure/types';
import {Observable, Subscriber} from 'rxjs';

@Injectable()
export class EventsService {
  eventLog: {[id: string]: IAction[]} = {};
  userIdToSessionIds: {[userId: string]: string[]} = {};
  subscribers: {[sessionId: string]: Subscriber<IAction>} = {};

  logEvent(action: IAction) {
    const email = action.user;
    if (!this.eventLog[email]) {
      this.eventLog[email] = [];
    }
    this.eventLog[email].push(action);
    this.sendMessage(action);
  }

  getEvents(email: string): IAction[] {
    return this.eventLog[email];
  }

  getEventStream(sessionId: string, userId: string): Observable<IAction> {
    return new Observable(subscriber => {
      this.subscribers[sessionId] = subscriber;
      this.associateSessionIdWithUserId(sessionId, userId);
    });
  }

  associateSessionIdWithUserId(sessionId: string, userId: string) {
    if (!this.userIdToSessionIds[userId]) {
      this.userIdToSessionIds[userId] = [];
    }
    this.userIdToSessionIds[userId].push(sessionId);
  }

  sendMessage(data: IAction) {
    const {userId, sessionId: sessionIdToExclude} = data;

    if (userId && this.userIdToSessionIds[userId]) {
      this.userIdToSessionIds[userId]
        .filter(sessionId => sessionId !== sessionIdToExclude)
        .forEach(sessionId => {
          this.subscribers[sessionId].next(data);
        });
    }
  }
}
