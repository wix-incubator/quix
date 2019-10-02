import './lib/ui/bootstrap';
import './lib/app';
import './lib/file-explorer';
import UrlPattern from 'url-pattern';

import {browserNotificationsManager} from './services';
import {INotebook, INote} from '@wix/quix-shared';

import './app.scss';

(window as any).UrlPattern = UrlPattern;  // expose for e2e tests

export const setupNotifications = (staticsBaseUrl: string) => {
  browserNotificationsManager.setStaticsBaseUrl(staticsBaseUrl);

  browserNotificationsManager.register({
    name: 'runnerFinished',
    icon: 'assets/notification_success.png',
    title: 'Quix: Run Finished',
    onlyWhenHidden: true,
    body: (note: INote, notebook: INotebook) => {
      return notebook ?
        `Note "${note.name}" on notebook "${notebook.name}" finished successfully.` :
        `Note "${note.name}" finished successfully.`;
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
        `Note "${note.name}" on notebook "${notebook.name}" has encountered an error.` :
        `Note "${note.name}" has encountered an error.`;
    },
    onClick() {
      this.close();
    }
  });
}