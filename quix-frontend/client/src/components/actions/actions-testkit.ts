import {Testkit} from '../../../test/e2e/driver';

const enum Hooks {
  Delete = 'actions-delete',
}

export class ActionsTestkit extends Testkit {
  async isDeleteEnabled() {
    return (await this.query.hook(Hooks.Delete)) !== null;
  }
}