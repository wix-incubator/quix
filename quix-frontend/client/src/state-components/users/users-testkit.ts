import {Testkit} from '../../../test/e2e/driver';

const enum Hooks {
  Error = 'users-error',
  Content = 'users-content'
}

export class UsersTestkit extends Testkit {
  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async numOfUsers() {
    return (await this.query.hooks('table-row')).length;
  }
}
