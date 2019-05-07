import {browserNotificationsManager} from './services';
import {INotebook, INote} from '../../shared';

export const setupNotifications = () => {
  browserNotificationsManager.register({
    name: 'runnerFinished',
    icon: 'assets/notification_success.png',
    title: 'Quix: Run Finished',
    onlyWhenHidden: true,
    body: (note: INote, notebook: INotebook) => {
      return notebook ?
        `Note \'${note.name}\' on notebook \'${notebook.name}\' finished successfully.` :
        `Note \'${note.name}\' finished successfully.`;
    },
    onClick(window) {
      window.focus();
      this.close();
    }
  });

  browserNotificationsManager.register({
    name: 'runnerError',
    icon: 'assets/notification_error.png',
    title: 'Quix: Error',
    onlyWhenHidden: true,
    body: (note: INote, notebook: INotebook) => {
      return notebook ?
        `Note \'${note.name}\' on notebook \'${notebook.name}\' has encountered an error.` :
        `Note \'${note.name}\' has encountered an error.`;
    },
    onClick(window) {
      this.close();
    }
  });
}