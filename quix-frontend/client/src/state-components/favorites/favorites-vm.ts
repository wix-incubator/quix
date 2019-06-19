import {StateManager} from '../../services/state';

enum States {
  Initial,
  Error,
  Result,
  Content
}

export default () => ({
  fields: null,
  $init() {
    this.state = new StateManager(States);
  }
});
