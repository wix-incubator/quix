import moment from 'moment';
import {last, find} from 'lodash';
import {inject} from '../../core';
import {default as RunnerQuery, IStatus, ITime, IField} from './runner-query';

// no actual runner logic should be handled here, just setters/getters
export default class State {
  private readonly state = {
    id: null,
    queries: [],
    progress: 0,
    totalNumOfQueries: 0,
    status: {
      running: false,
      success: false,
      finished: false,
      error: false,
      killed: false
    } as IStatus,
    time: {
      elapsed: '00:00',
      started: null,
      interval: null
    } as ITime
  };

  public getId(): string {
    return this.state.id;
  }

  public setId(id): State {
    this.state.id = id;
    return this;
  }

  public getFields(): IField[] {
    return this.state.queries.length && this.getCurrentQuery().getFields();
  }

  public getResults() {
    return this.state.queries.length && this.getCurrentQuery().getResults();
  }

  public getError() {
    return this.state.queries.length && this.getCurrentQuery().getError();
  }

  public hasQueries(): boolean {
    return !!this.getQueries().length;
  }

  public getQueries(): RunnerQuery[] {
    return this.state.queries;
  }

  public getCurrentQuery(): RunnerQuery {
    // if (!this.state.queries.length) {
    //   throw 'Runner.state: there are 0 queries in the pool';
    // }

    return last(this.state.queries);
  }

  public getQueryById(id): RunnerQuery {
    return find(this.state.queries, query => query.getId() === id);
  }

  public startQuery(id): State {
    this.state.queries.push(new RunnerQuery(id, this.state.queries.length).start());
    return this;
  }

  public endQuery(id): State {
    this.getQueryById(id).end();
    return this;
  }

  public getTotalNumOfQueries() {
    return this.state.totalNumOfQueries;
  }

  public setTotalNumOfQueries(num) {
    return this.state.totalNumOfQueries = num;
  }

  public getProgress(): number {
    return this.state.progress;
  }

  public setProgress(progress): State {
    this.state.progress = progress;
    return this;
  }

  public getStatus(): IStatus {
    return this.state.status;
  }

  public startDurationCount() {
    this.state.time.started = Date.now();

    this.state.time.interval = inject('$interval')(() => {
      const now = moment();
      this.state.time.elapsed = now.subtract(this.state.time.started).format('mm:ss');
    }, 1000);

    return this;
  }

  public stopDurationCount() {
    inject('$interval').cancel(this.state.time.interval);
    return this;
  }

  public getTime(): ITime {
    return this.state.time;
  }

  public setRunningStatus(value: boolean): State {
    this.state.status.running = value;
    return this;
  }

  public setSuccessStatus(value: boolean): State {
    this.state.status.success = value;
    return this;
  }

  public setFinishedStatus(value: boolean): State {
    this.state.status.finished = value;
    return this;
  }

  public setErrorStatus(value: boolean): State {
    this.state.status.error = value;
    return this;
  }

  public setKilledStatus(value: boolean): State {
    this.state.status.killed = value;
    return this;
  }
}
