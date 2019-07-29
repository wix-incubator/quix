import template from './home.html';
import './home.scss';

import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {addNotebook, goToExamples, goToRoot} from '../../services';

export default (app: App, store: Store) => ({
  name: 'home',
  template,
  url: {},
  scope: {},
  controller: (scope, params, {setTitle}) => setTitle(),
  link: scope => {
    initNgScope(scope)
      .withEvents({
        onNotebooksClick() {
          goToRoot(app);
        },
        onNotebookAdd() {
          addNotebook(store, app, []);
        },
        onExamplesClick() {
          goToExamples(app);
        }
      });
  }
}) as IStateComponentConfig;
