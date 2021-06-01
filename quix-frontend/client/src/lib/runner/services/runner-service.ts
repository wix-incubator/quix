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

function sendSocketData(socket, code, user, transformers, mode = 'stream') {
  const session: any = {mode};

  if (user && user.getPermission() && user.getPermission().isElevated()) {
    session['user.password'] = user.getPermission().getPassword();
  }

  socket.on('open', async () => {
    code = await transformers.request(code);

    socket.send({
      event: 'execute',
      data: {code, session}
    });
  });
}

export class Runner extends srv.eventEmitter.EventEmitter {
  private readonly mode: string;
  private readonly version: number;
  private readonly executeBaseUrl: string;
  private socket: RunnerSocket;
  private readonly events: RunnerEvents;
  private readonly state = new RunnerState();
  private code = null;
  private logEvents: boolean = false;
  private keepAliveInterval;
  private numOfRetries = 0;

  private readonly transformers = {
    request: request => request,
    response: response => response
  };

  constructor(private readonly type: RunnerType, private readonly scope, options) {
    super();

    this.mode = options.mode;
    this.version = options.version || 1;
    this.executeBaseUrl = options.executeBaseUrl;
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

      .register('query-start', (data) => {
        this.getState()
          .startQuery(data.id);

        this.stream('queryCreated', this, this.getState().getCurrentQuery());

        return data;
      });

      this.getEvents().register('query-download', (data) => {
        if (data.url) {
          this.fire('downloadFile', `${this.executeBaseUrl}${data.url}`, this, this.getCurrentQuery());
        }
      })

      .register('query-end', data => {
        this.getCurrentQuery().setStats(data.statistics);
        this.getState().endQuery(data.id);

        return data;
      })

      .register('percentage', (data, meta, status) => {
        const totalQueries = this.getTotalNumOfQueries();
        const percentagePerQuery = 100 / totalQueries;
        const totalQueriesUntilNow = this.getState().getQueries().length - 1;
        const percentageUntilNow = totalQueriesUntilNow * percentagePerQuery;
        const thisQueryPercentage = data.percentage * percentagePerQuery / 100;

        this.getState()
          .setProgress(Math.round(percentageUntilNow + thisQueryPercentage))
          .setSuccessStatus(true);

        if (status.callCount === 1) {
          this.fire('success', this, this.getCurrentQuery());
        }

        return data;
      })

      .register('error', (data) => {
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

        query.addRow(data.values);

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
    this.getState().setRunningStatus(true);
    
    if (this.numOfRetries === 0) {
      this.getState().startDurationCount();
      this.keepAliveInterval = inject('$interval')(() => this.getSocket().send({
        event: 'ping'
      }), 30 * 1000);
    }
  }

  protected finish() {
    inject('$interval').cancel(this.keepAliveInterval);

    this.getSocket().close();

    this.getState()
      .setRunningStatus(false)
      .setFinishedStatus(true)
      .stopDurationCount();

    this.getState().getQueries().forEach(query => {
      if (!query.finished) {
        this.getState().endQuery(query.getId());
      }
    });

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

  public getCode() {
    return this.code;
  }

  public transformRequest(transformer): Runner {
    this.transformers.request = transformer || this.transformers.request;

    return this;
  }

  public transformResponse(transformer): Runner {
    this.transformers.response = transformer || this.transformers.response;

    return this;
  }

  public run(code, user?): Runner {
    this.socket = new RunnerSocket(this.type, this.version, this.executeBaseUrl);
    this.code = code;

    initSocket(this.socket, this.events, this.transformers, this.scope, this.logEvents);
    sendSocketData(this.socket, code, user, this.transformers, this.mode);

    this.socket.on('close', () => {
      if (this.getState().getStatus().finished) {
        return;
      }

      const connectionId = this.getState().getId();

      if (
        this.numOfRetries < 10 &&
        (!connectionId || (
          this.getQueries().length === 1
          && !this.getCurrentQuery().getResults().bufferSize()
        ))
      ) {
        this.numOfRetries++;
        this.run(code, user);
        return;
      }

      this.getScope().$apply(() => {
        this.getEvents().apply('error', {
          message: this.getConnectionErrorMessage(connectionId),
        }, {});

        this.finish();
      });
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

  getConnectionErrorMessage(connectionId) {
    return `Connection failed after (${this.numOfRetries}) retries, please rerun your query manually.   
This is most likely a transient network error and not a problem with the ${inject('$filter')('biToHumanCase')(this.type)} engine.
-------------------------------------------------------------------------------------------------
Connection ID: ${connectionId}
Connection start time: ${inject('$filter')('biDate')(this.getState().getTime().started, 'seconds')}
Connection elapsed time: ${this.getState().getTime().elapsed}
-------------------------------------------------------------------------------------------------
${this.getCurrentQuery() ? `Query ID: ${this.getCurrentQuery().getId()}` : ''}
${this.getCurrentQuery() ? `Query start time: ${inject('$filter')('biDate')(this.getCurrentQuery().getTime().started, 'seconds')}` : ``}
${this.getCurrentQuery() ? `Query elapsed time: ${this.getCurrentQuery().getTime().elapsed}` : ``}
${this.getCurrentQuery() ? `Fetched rows: ${this.getCurrentQuery().getResults().bufferSize()}` : ``}
`
  }
}

export default function create(type: RunnerType, scope, {
  mode = 'stream',
  version = null,
  executeBaseUrl = config.get().executeBaseUrl,
} = {
    mode: 'stream',
    version: null,
    executeBaseUrl: config.get().executeBaseUrl,
}) {
  if (!executeBaseUrl) {
    throw new Error('Missing execute url definition');
  }

  return new Runner(type, scope, {mode, version, executeBaseUrl});
}
