import {StateManager} from '../../services/state';

enum States {
  Initial,
  Error,
  Result,
  Content
}

export default () => ({
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
      fold: true,
      focusName: false
    }).identifyBy(({id, noteId}) => id || noteId);

    this.state = new StateManager(States);
    this.marked.map = {};
    this.marked.list = [];
  }
});
