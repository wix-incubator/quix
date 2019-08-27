import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IReactStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {Home, HomeProps} from './HomeComponent';
import {initNgScope} from '../../lib/core';
import {addNotebook, goToExamples, goToRoot} from '../../services';
import { goToNotebook } from '../../services/notebook';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'home',
  template: Home,
  url: {},
  scope: {
    events: () => {
      return;
    }
  },
  controller: ($scope: HomeProps, params, {setTitle}) => {
    initNgScope($scope).withEvents({
      onNotebooksClick() {
        goToRoot(app);
      },
      onNotebookAdd() {
        addNotebook(store, app, [], {addNote: true})
          .then(notebook => goToNotebook(app, notebook, {isNew: true}));
      },
      onExamplesClick() {
        goToExamples(app);
      }
    });

    return setTitle();
  },
});
