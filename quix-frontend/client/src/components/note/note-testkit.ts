import {Testkit} from '../../../test/e2e/driver';
import {ActionsTestkit} from '../actions/actions-testkit';
import {RunnerTestkit} from '../runner/runner-testkit'

const enum Hooks {
  Name = 'note-name',
  Select = 'note-select',
}

export class NoteTestkit extends Testkit {
  async getActionsTestkit() {
    return new ActionsTestkit(await this.query.$('quix-actions'));
  }

  async getRunnerTestkit() {
    return new RunnerTestkit(await this.query.$('quix-runner'));
  }

  async isNameFocused() {
    return (await this.query.hook(Hooks.Name, ':focus')) !== null;
  }

  async isSelectEnabled() {
    return (await this.query.hook(Hooks.Select)) !== null;
  }

  async isNameEditable() {
    return this.evaluate.hook(Hooks.Name, el => el.getAttribute('contenteditable') === 'true');
  }
}