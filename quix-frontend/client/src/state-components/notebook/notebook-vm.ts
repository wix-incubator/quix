import {StateManager} from '../../services/state';
import {Instance} from '../../lib/app';

enum States {
  Initial,
  Error,
  Result,
  Content
}

export default (app: Instance) => ({
  note: null,
  breadcrumbs: {
    enabled: true,
    folders: [{name: 'My notebooks'}],
  },
  view: {
    hasChanges: false
  },
  marked: {},
  $init() {
    this.notes = this.createItemsVm({
      fold: null,
      scrollTo: false,
      focusName: false
    });

    this.noteTypes = app.getConfig().getModulesByComponent('note').map(({id}) => id);
    this.state = new StateManager(States);
    this.marked.map = {};
    this.marked.list = [];
  }
});
