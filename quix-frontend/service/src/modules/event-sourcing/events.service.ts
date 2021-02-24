import {Injectable} from '@nestjs/common';
import {IAction} from './infrastructure/types';
import {Observable, Subscriber} from 'rxjs';

@Injectable()
export class EventsService {
  userIdToSessionIds: {[userId: string]: string[]} = {};
  subscribers: {[sessionId: string]: Subscriber<IAction>} = {};

  logEvent(action: IAction) {
    this.sendMessage(action);
  }

  getEventStream(sessionId: string, userId: string): Observable<IAction> {
    return new Observable(subscriber => {
      this.subscribers[sessionId] = subscriber;
      this.associateSessionIdWithUserId(sessionId, userId);
    });
  }

  closeEventStream(sessionId: string, userId: string) {
    const subscriber = this.subscribers[sessionId];
    if (subscriber) {
      subscriber.complete();
      delete this.subscribers[sessionId];
    }
    if (this.userIdToSessionIds[userId]) {
      const subscribers = this.userIdToSessionIds[userId].filter(
        s => s !== sessionId,
      );
      if (subscribers.length) {
        this.userIdToSessionIds[userId] = subscribers;
      } else {
        delete this.userIdToSessionIds[userId];
      }
    }
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
