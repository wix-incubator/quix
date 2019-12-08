import {StateManager} from '../../../services/state';
import {App} from '../../../lib/app';

enum States {
  Initial,
  Error,
  Content
}

export default (app: App) => ({
  $init() {
    this.state = new StateManager(States);
  }
});
