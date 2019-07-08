import {StateManager} from '../../services/state';
import {Instance} from '../../lib/app';
import {pluginManager} from '../../plugins';

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

    this.noteTypes = pluginManager.getPluginIdsByType('note');
    this.state = new StateManager(States);
    this.marked.map = {};
    this.marked.list = [];
  }
});
