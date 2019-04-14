import {values} from 'lodash';
import RunnerEvent from './runner-event';

export default class RunnerEvents {
  private readonly handlers: {[eventName: string]: RunnerEvent} = {};

  constructor(private readonly runner) {

  }

  public register(eventName, handler, options = {dontDigest: false}) {
    const event = this.handlers[eventName] = new RunnerEvent(eventName, options);

    event.append(handler);

    return this;
  }

  public getRegisteredEvents(): RunnerEvent[] {
    return values<RunnerEvent>(this.handlers);
  }

  public append(eventName, handler): RunnerEvents {
    this.handlers[eventName].append(handler);
    return this;
  }

  public prepend(eventName, handler): RunnerEvents {
    this.handlers[eventName].prepend(handler);
    return this;
  }

  public apply(eventName, data, meta): RunnerEvents {
    if (this.runner.getState().getStatus().killed) {
      return;
    }

    this.handlers[eventName].apply(data, meta);

    return this;
  }
}
