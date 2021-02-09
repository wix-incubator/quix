import template from './note-share.html';
import './note-share.scss';

import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './note-share-types';

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    note: '<',
    notebook: '<',
    params: '<',
  },
  link: {
    async pre(scope: IScope) {
      scope.shareUrl = [app.getNavigator().getUrl(null, {id: scope.notebook.id, note: scope.note.id}), scope.params]
        .filter(x => !!x)
        .join('');

      const embedUrl = [app.getNavigator().getUrl('auth.base.embed.notebook', {id: scope.notebook.id, note: scope.note.id}), scope.params]
        .filter(x => !!x)
        .join('');

      scope.embedHtml = `<iframe src="${embedUrl}" frameborder="0"></iframe>`;  
    }
  }
});
