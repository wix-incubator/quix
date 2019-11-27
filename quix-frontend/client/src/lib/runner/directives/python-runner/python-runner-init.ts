import {last} from 'lodash';
import {Runner} from '../../services/runner-service';
import {RunnerComponentInstance} from "../runner/runner";

function initConsoleEvents(runner: Runner) {
  const state = runner.getState();
  const events = runner.getEvents();
  const id = 'console';

  events.register('log', data => {
    if (!state.getQueryById(id).getFields().length) {
      events.apply('fields', {id, fields: Object.keys(data)}, {});
    }

    events.apply('row', {id, row: data}, {});

    return data;
  });

  events
    .append('start', data => {
      events.apply('query-start', {id, title: id}, {});
      state.setTotalNumOfQueries(1);

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
  const title = 'result';

  ['fields', 'row'].forEach(event => events.prepend(event, data => {
    if (data.id !== 'console') {
      data.id = state.getQueries()[1].getId();
      state.setTotalNumOfQueries(2);
    }

    return data;
  }));

  events
    .append('query-start', data => {
      runner.getState().getQueryById(data.id).setTitle(data.title || title);

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