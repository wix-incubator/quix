import { Testkit } from '../../../test/e2e/driver';

const enum Hooks {
    ToggleRun = 'runner-toggle-run'
}
export class RunnerTestkit extends Testkit {

    async clickRun() {
        await this.click.hook(Hooks.ToggleRun)
    }

    async isDialogOpen() {
        const dialog = await this.query.$('dialog');
        return !!dialog
    }
}