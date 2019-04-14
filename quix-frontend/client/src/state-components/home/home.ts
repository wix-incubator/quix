import template from './home.html';
import './home.scss';

import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {addNotebook} from '../../services/notebook';

export default (app: App, store: Store) => ({
  name: 'base.home',
  template,
  url: {},
  scope: {},
  controller: x => x,
  link: scope => {
    initNgScope(scope)
      .withEvents({
        onNotebooksClick() {
          app.getNavigator().go('base.files');
        },
        onNotebookAdd() {
          addNotebook(store, app);
        }
      });
  }
}) as IStateComponentConfig;
