import {inject, srv} from '../../core';
import {RunnerSocket} from './runner-socket';
import RunnerEvents from './runner-events';
import RunnerState from './runner-state';
import RunnerQuery from './runner-query';
import {RunnerType} from '../typings/runner-types';
import { config } from '../config';

function initSocket(socket: RunnerSocket, events: RunnerEvents, transformers, scope, log: boolean = false) {
  events.getRegisteredEvents().forEach(event => {
    const eventName = event.getName();

    socket.on(eventName, ({data, meta}) => {
      if (log) {
        /* tslint:disable-next-line:no-console */
        console.log(eventName, data, meta);
      }

      if (event.getOptions().dontDigest) {
        events.apply(eventName, data, meta);
      } else {
        scope.$apply(() => {
          events.apply(eventName, data, meta);
        });
      }
    });
  });

  socket.transformResponse(transformers.response);
}

function sendSocketData(socket, data, user, transformers, mode = 'stream', metaKey = 'session') {
  const meta: any = {};

  if (user && user.getPermission() && user.getPermission().isElevated()) {
    meta['user.password'] = user.getPermission().getPassword();
  }

  meta.mode = mode;

  socket.on('open', () => {
    const transformed = transformers.request({data, meta});

    if (transformed.data && transformed.data.then) {
      transformed.data.then(transformedData => socket.send({data: transformedData, [metaKey]: transformed.meta}));
    } else {
      socket.send({code: transformed.data, [metaKey]: transformed.meta});
    }
  });
}

export class Runner extends srv.eventEmitter.EventEmitter {
  private readonly mode: string;
  private readonly version: number;
  private readonly baseUrl: string;
  private socket: RunnerSocket;
  private readonly events: RunnerEvents;
  private readonly state = new RunnerState();
  private payload = null;
  private logEvents: boolean = false;
  private keepAliveInterval;

  private readonly transformers = {
    request: request => request,
    response: response => response
  };

  constructor(private readonly type: RunnerType, private readonly scope, options) {
    super();

    this.mode = options.mode;
    this.version = options.version || 1;
    this.baseUrl = options.baseUrl;
    this.events = new RunnerEvents(this);

    this.events
      .register('start', data => {
        this.getState()
          .setId(data.id)
          .setTotalNumOfQueries(data.numOfQueries);

        this.fire('start', this);

        return data;
      })

      .register('end', data => {
        this.finish();

        return data;
      })

      .register('query-start', (data, meta, status) => {
        this.getState()
          .startQuery(data.id);

        this.stream('queryCreated', this, this.getState().getCurrentQuery());

        return data;
      });

      this.getEvents().register('query-validation', (data) => {
        if (data.downloadUrl) {
          this.fire('downloadFile', data.downloadUrl, this, this.getCurrentQuery());
        }
      })

      .register('query-end', data => {
        this.getState().endQuery(data.id);

        return data;
      })

      .register('progress', (data, meta, status) => {
        const totalQueries = this.getTotalNumOfQueries();
        const percentagePerQuery = 100 / totalQueries;
        const totalQueriesUntilNow = this.getState().getQueries().length - 1;
        const percentageUntilNow = totalQueriesUntilNow * percentagePerQuery;
        const thisQueryPercentage = meta.percentage * percentagePerQuery / 100;

        this.getState()
          .setProgress(Math.round(percentageUntilNow + thisQueryPercentage))
          .setSuccessStatus(true);

        if (status.callCount === 1) {
          this.fire('success', this, this.getCurrentQuery());
        }

        return data;
      })

      .register('error', (data, meta, status) => {
        if (!this.getState().getCurrentQuery()) {
          // error happened in a very early stage of execution, some events need to be simulated
          this.events
            .apply('start', {id: 1}, {})
            .apply('query-start', {id: 1}, {})
            .apply('query-end', {id: 1}, {});
        }

        const query = this.getState()
          .setErrorStatus(true)
          .getCurrentQuery().setError(data);

        this.fire('error', this, data, query);

        return data;
      })

      .register('fields', data => {
        const query = data.id ? this.getState().getQueryById(data.id) : this.getState().getCurrentQuery();

        query.setFields(data.fields);

        return data;
      })

      .register('row', (data, meta, status) => {
        const query = data.id ? this.getState().getQueryById(data.id) : this.getState().getCurrentQuery();

        query.addRow(data.row);

        if (status.callCount === 1) {
          this.fire('firstResultReceived', this);
        } else if (status.callCount === 2) {
          this.fire('moreResultReceived', this);
        }

        return data;
      }, {dontDigest: true});
  }

  protected log(value: boolean) {
    this.logEvents = value;
  }

  protected start() {
    this.getState()
      .setRunningStatus(true)
      .startDurationCount();
    
    this.keepAliveInterval = inject('$interval')(() => this.getSocket().send('ping'), 30 * 1000);
  }

  protected finish() {
    inject('$interval').cancel(this.keepAliveInterval);

    this.getSocket().close();

    this.getState()
      .setRunningStatus(false)
      .setFinishedStatus(true)
      .stopDurationCount();

    if (this.getState().hasQueries()) {
      const query = this.getState().getCurrentQuery();

      if (!query.finished) {
        this.getState().endQuery(query.getId());
      }
    }

    this.fire('finish', this);
  }

  public getScope() {
    return this.scope;
  }

  public getSocket() {
    return this.socket;
  }

  public getEvents() {
    return this.events;
  }

  public getState() {
    return this.state;
  }

  public getQueries(): RunnerQuery[] {
    return this.getState().getQueries();
  }

  public getTotalNumOfQueries(): number {
    return this.getState().getTotalNumOfQueries();
  }

  public getCurrentQuery(): RunnerQuery {
    return this.getState().getCurrentQuery();
  }

  public getMode(): string {
    return this.mode;
  }

  public get error() {
    return this.getState().getError();
  }

  public get progress() {
    return this.getState().getProgress();
  }

  public get elapsedTime() {
    return this.getState().getTime().elapsed;
  }

  public get running() {
    return this.getState().getStatus().running;
  }

  public getPayload() {
    return this.payload;
  }

  public transformRequest(transformer): Runner {
    this.transformers.request = transformer || this.transformers.request;

    return this;
  }

  public transformResponse(transformer): Runner {
    this.transformers.response = transformer || this.transformers.response;

    return this;
  }

  public run(data, user?): Runner {
    this.socket = new RunnerSocket(this.type, this.version, this.baseUrl);
    this.payload = data;

    initSocket(this.socket, this.events, this.transformers, this.scope, this.logEvents);
    sendSocketData(this.socket, data, user, this.transformers, this.mode, this.version >=2 ? 'session' : 'meta');

    this.socket.on('close', () => {
      if (!this.getState().getStatus().finished) {
        this.getScope().$apply(() => {
          this.getEvents().apply('error', {message: 'Connection lost'}, {});
          this.finish();
        });
      }
    });

    this.start();

    return this;
  }

  public kill() {
    this.getState().setKilledStatus(true);

    if (!this.running) {
      return;
    }

    this.finish();
  }
}

export default function create(type: RunnerType, scope, {
  mode = 'stream',
  version = null,
  baseUrl = config.get().prestoUrl
} = {
    mode: 'stream',
    version: null,
    baseUrl: config.get().prestoUrl
}) {
  if (!baseUrl) {
    throw new Error('Missing base url definition');
  }

  return new Runner(type, scope, {mode, version, baseUrl});
}
