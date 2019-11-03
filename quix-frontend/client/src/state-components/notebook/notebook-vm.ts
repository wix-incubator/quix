import {StateManager} from '../../services/state';
import {App} from '../../lib/app';
import {pluginManager} from '../../plugins';

enum States {
  Initial,
  Error,
  Result,
  Content
}

export default (app: App) => ({
  note: null,
  breadcrumbs: [{name: 'My notebooks'}],
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

    this.noteTypes = pluginManager.module('note').plugins()
      .filter(plugin => plugin.getConfig().canCreate)
      .map(plugin => plugin.getId());

    this.state = new StateManager(States);
    this.marked.map = {};
    this.marked.list = [];
  }
});
