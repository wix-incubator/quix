import {Testkit} from '../../../test/e2e/driver';

const enum Hooks {
  Menu = 'actions-menu',
  Delete = 'actions-delete',
}

export class ActionsTestkit extends Testkit {
  async isDeleteEnabled() {
    return (await this.query.hook(Hooks.Menu)) !== null;
  }
}