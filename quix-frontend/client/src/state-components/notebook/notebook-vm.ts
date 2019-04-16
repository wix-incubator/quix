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
      fold: null,
      scrollTo: false,
      focusName: false
    });

    this.state = new StateManager(States);
    this.marked.map = {};
    this.marked.list = [];
  }
});
