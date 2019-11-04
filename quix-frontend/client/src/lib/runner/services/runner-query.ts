import {zipObject} from 'lodash';
import moment from 'moment';
import {srv, inject} from '../../core';

export interface IField {
  name: string;
  title?: string;
}

export interface IError {
  msg: string;
  details: Object;
}

export interface ITime {
  elapsed: string;
  started: number;
  interval;
}

export interface IStatus {
  running: boolean;
  success: boolean;
  finished: boolean;
  error: boolean;
  killed: boolean;
}

function getFieldName(field: string, fieldNames: Record<string, number>) {
  fieldNames[field] = fieldNames[field] || 0;

  return field + `${fieldNames[field]++ ? `_${fieldNames[field]}` : ''}`;
}

function startDurationCount(): ITime {
  const res: ITime = {
    elapsed: '00:00',
    started: Date.now(),
    interval: null
  };

  res.interval = inject('$interval')(() => {
    const now = moment();
    res.elapsed = now.subtract(res.started).format('mm:ss');
  }, 1000);

  return res;
}

function stopDurationCount(time) {
  inject('$interval').cancel(time.interval);
}

export default class RunnerQuery extends srv.eventEmitter.EventEmitter {
  private details = {};
  private readonly metadata = {};
  private title;
  private _fields: IField[] = [];
  private _rawFields: string[] = [];
  private readonly _results = new srv.collections.BufferedCollection().setChunkSize(20);
  private fastForwardPromise = null;
  private error: IError;
  private time: ITime = {
    elapsed: null,
    started: null,
    interval: null
  };
  private readonly status: IStatus = {
    running: false,
    success: false,
    finished: false,
    error: false,
    killed: false
  };

  constructor(private readonly id, private readonly index) {
    super();
  }

  public meta(name, value?) {
    if (value) {
      this.metadata[name] = value;
      return this;
    }
    return this.metadata[name];
  }

  public setDetails(details) {
    this.details = details;
    return this;
  }

  public getDetails() {
    return this.details;
  }

  public get results(): any {
    return this.getResults();
  }

  public get fields(): IField[] {
    return this.getFields();
  }

  public get running(): boolean {
    return this.status.running;
  }

  public get success(): boolean {
    return this.status.success;
  }

  public get finished(): boolean {
    return this.status.finished;
  }

  public get elapsedTime(): string {
    return this.getTime().elapsed;
  }

  public get startTime(): number {
    return this.getTime().started;
  }

  public getId(): string {
    return this.id;
  }

  public getIndex(): number {
    return this.index;
  }

  public getResults(): any {
    return this._results;
  }

  public getFields(): IField[] {
    return this._fields;
  }

  public getRawFields(): string[] {
    return this._rawFields;
  }

  public getError(): IError {
    return this.error;
  }

  public getTime(): ITime {
    return this.time;
  }

  public getTitle() {
    return this.title;
  }

  public setTitle(title: string): RunnerQuery {
    this.title = title;
    return this;
  }

  public setFields(fields: string[]): RunnerQuery {
    const fieldNames = {};

    this._fields = fields.map(name => ({
      name: getFieldName(name, fieldNames),
    }));


    this._rawFields = this._fields.map(({name}) => name);

    return this;
  }

  public addRow(row): Object {
    this._results.feed(zipObject(this._rawFields, row));

    if (this.getResults().bufferSize() === 1) {
      this.fire('firstResultReceived', this);
    } else if (this.getResults().bufferSize() === 2) {
      this.fire('moreResultReceived', this);
    }


    // Fast-forward slow rows
    if (this._results.size() < this._results.getChunkSize()) {
      this.fastForwardPromise = this.fastForwardPromise ? this.fastForwardPromise.then(() => {
        if (this._results.size() < this._results.getChunkSize()) {
          return this._results.more();
        }
      }) : this._results.more();   
    }

    return this;
  }

  public setError(error): RunnerQuery {
    this.error = error;
    this.fire('error', this, error);

    return this;
  }

  public setErrorMessage(msg) {
    this.error.msg = msg;
  }

  public start(): RunnerQuery {
    this._results.fetch();
    this.status.running = true;
    this.status.success = true;

    this.time = startDurationCount();

    return this;
  }

  public end(): RunnerQuery {
    this._results.seal();
    this.status.running = false;
    this.status.finished = true;

    stopDurationCount(this.time);

    this.fire('finish', this);

    return this;
  }
}
