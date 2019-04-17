import {inject, srv, utils} from '../../core';
import {toast} from '../../ui';

const {injector} = srv;

function onError(error) {
  toast.showToast({text: 'Action failed', cancel: 'close', type: 'error'}, 3000);
  return inject('$q').reject(error);
}

const toScalaEvent = (eventName: string, data: object) => ({name: eventName, data: utils.stripDollars(data)});
const toNodeAction = (eventName: string, data: object) => ({type: eventName, ...utils.stripDollars(data)});
export type ServerFrameworkType = 'Scala' | 'Node';

export default class StoreLogger {
  private resource;
  private readonly transform;

  constructor(endpoint, private readonly sessionId = null, server: ServerFrameworkType = 'Scala' ) {
    injector.on('ready', () => {
      this.resource = inject('$resource')(endpoint, {sessionId: '@sessionId'}, {events: {method: 'POST'}});
    });
    this.transform = server === 'Scala' ? toScalaEvent : toNodeAction;
  }

  log(eventName, data) {
    return this.resource.events({sessionId: this.sessionId}, [this.transform(eventName, data)]).$promise.catch(onError);
  }

  bulk() {
    const resource = this.resource;
    const self = this;
    return {
      events: [],
      add(eventName, data) {
        this.events.push(self.transform(eventName, data));
        return this;
      },
      log() {
        return resource.events({sessionId: this.sessionId}, this.events).$promise.catch(onError);
      }
    };
  }
}