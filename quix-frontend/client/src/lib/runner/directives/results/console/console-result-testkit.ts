import { Testkit } from '../../../../../../test/e2e/driver';

const enum Hooks {
  Result = 'console-result-timestamp',
  ValueRow = 'console-result-value-row'
}

export class ConsoleResultTestkit extends Testkit {
  async getTimestampsCount() {
    return (await this.query.hooks(Hooks.Result)).length;
  }

  async getValueRowsCount() {
    return (await this.query.hooks(Hooks.ValueRow)).length;
  }
}
