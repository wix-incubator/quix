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
    events: () => {},
    vm: () => {}
  },
  controller: (scope: HomeProps, params, {setTitle}) => {
    initNgScope(scope)
      .withVM({
        examples: {}
      })
      .withEvents({
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

    scope.vm.examples.toggle(!!app.getConfig().getMode().demo);

    return setTitle();
  },
});
