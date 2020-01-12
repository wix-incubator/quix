import { Testkit } from '../../../test/e2e/driver';

const enum Hooks {
  Error = 'history-error',
  Content = 'history-content'
}

export class HistoryTestkit extends Testkit {
  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async numOfHistory() {
    return (await this.query.hooks('table-row')).length;
  }
}
