import {last} from 'lodash';
import moment from 'moment';
import {Runner} from '../../services/runner-service';
import {RunnerComponentInstance} from '../runner/runner';

function initConsoleEvents(runner: Runner) {
  const state = runner.getState();
  const events = runner.getEvents();
  const id = 'console';

  events.register('log', data => {
    data = {...data, timestamp: moment().format('HH:mm:ss')};

    const fields = Object.keys(data);
    const values = [...fields.map(field => data[field])];

    if (!state.getQueryById(id).getFields().length) {
      events.apply('fields', {id, fields}, {});
    }

    events.apply('row', {id, values}, {});

    return data;
  });

  events
    .append('start', data => {
      events.apply('query-start', {id}, {});
      events.apply('query-details', {id, code: 'console'}, {});

      return data;
    })
    .prepend('end', data => {
      state.getQueryById(id) && events.apply('query-end', {id}, {});

      return data;
    });
}

function initResultEvents(runner: Runner) {
  const state = runner.getState();
  const events = runner.getEvents();

  events.append('query-start', () => {
    state.setTotalNumOfQueries(state.getTotalNumOfQueries() + 1);
  });

  events.register('query-details', data => {
    runner.getState().getQueryById(data.id).setTitle(data.code);

    return data;
  });
}

function initRunnerComponent(runner: Runner, runnerComponentDeferred: Promise<RunnerComponentInstance>) {
  runner.on('finish', () => {
    return runnerComponentDeferred.then(runnerComponent => {
      if (runner.getTotalNumOfQueries() > 1) {
        runnerComponent.setCurrentQuery(last(runner.getQueries()));
      }
    });
  }, true);
}

export default (runner: Runner, runnerComponentDeferred: Promise<RunnerComponentInstance>) => {
  initConsoleEvents(runner);
  initResultEvents(runner);
  initRunnerComponent(runner, runnerComponentDeferred);
}