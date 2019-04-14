import {EventEmitter} from '../event-emitter';

let _injector = null;
const eventEmitter = new EventEmitter();

function use(realInjector): void {
  _injector = realInjector;
  eventEmitter.trigger('ready');
}

export function get(dependencyName: string): any {
  return _injector.get(dependencyName);
}

function on(event: string, callback: (...args: any[]) => any) {
  eventEmitter.on(event, callback, true);
}

window.addEventListener('biCore.injector.ready', (e: any) => use(e.detail));

export const injector = {use, get, on};
