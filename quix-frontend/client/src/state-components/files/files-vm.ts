import {StateManager} from '../../services/state';

enum States {
  Initial,
  Error,
  Result,
  Content
}

export default () => ({
  fields: null,
  breadcrumbs: [{name: 'My notebooks'}],
  marked: {},
  $init() {
    this.state = new StateManager(States);
    this.marked.map = {};
    this.marked.list = [];

    this.files = this.createItemsVm({
      isNew: null
    });
  }
});
