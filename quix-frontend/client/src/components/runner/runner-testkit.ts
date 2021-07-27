import { Testkit } from '../../../test/e2e/driver';
import { ConsoleResultTestkit } from '../../lib/runner/directives/results/console/console-result-testkit';

const enum Hooks {
  ToggleRun = 'runner-toggle-run',
}
export class RunnerTestkit extends Testkit {
  async getConsoleResultTestkit() {
    return new ConsoleResultTestkit(await this.query.$('bi-console-result'));
  }

  async clickRun() {
    await this.click.hook(Hooks.ToggleRun);
  }
}