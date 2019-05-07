import {fromPairs} from 'lodash';
import {Runner} from '../lib/runner';
import {browserNotificationsManager} from '../services/notifications';
import {INotebook, INote} from '../../../shared/dist';


const runners = new Map();

export const addRunner = (id: string, runner: Runner, note: INote, notebook: INotebook) => {
  runner.on('finish', (r: Runner) => {
    const status = computeFinishState(r);
    if (status === 'finished') {
      browserNotificationsManager.notify('runnerFinished', note, notebook);
    } else {
      browserNotificationsManager.notify('runnerError', note, notebook);
    }
  });
  runners.set(id, runner);
}

export const removeRunner = (id: string) => {
  runners.delete(id);
}

export const getRunner = (id: string) => {
  return runners.get(id);
}

export const getRunners = () => fromPairs([...runners.entries()]);

const computeFinishState = (runner: Runner) => {
  const status = runner.getState().getStatus();
  if (status.error) {
    return 'error';
  } if (status.killed) {
    return 'killed';
  }
  return 'finished';
}

browserNotificationsManager.register({
  name: 'runnerFinished',
  icon: 'assets/ic_check_circle_black_36dp_2x.png',
  title: 'Quix: Run Finished',
  onlyWhenHidden: true,
  body: (note: INote, notebook: INotebook) => {
    return notebook ?
      `Note \'${note.name}\' on notebook \'${notebook.name}\' finished successfully.` :
      `Note \'${note.name}\' finished successfully.`;
  },
  onClick (window) {
    window.focus();
    this.close();
  }
});

browserNotificationsManager.register({
  name: 'runnerError',
  icon: 'assets/ic_error_outline_black_36dp_2x.png',
  title: 'Quix: Error',
  onlyWhenHidden: true,
  body: (note: INote, notebook: INotebook) => {
    return notebook ?
      `Note \'${note.name}\' on notebook \'${notebook.name}\' has encountered an error.` :
      `Note \'${note.name}\' has encountered an error.`;
  },
  onClick (window) {
    this.close();
  }
});