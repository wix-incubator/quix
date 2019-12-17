import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';

export default (app: App, store: Store) => ({
  name: 'embed',
  abstract: true,
  template: '<div ui-view class="bi-c-h bi-grow"></div>',
  url: {},
  scope: {},
  controller: (scope, params, {syncUrl}) => {
  },
  link: (scope) => {

  },
  onEnter() {
    app.toggleHeader(false);
    app.toggleMenu(false);
  }
}) as IStateComponentConfig;
