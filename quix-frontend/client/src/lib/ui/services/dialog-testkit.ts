import { Testkit } from '../../../../test/e2e/driver';

export class DialogTestkit extends Testkit {
  async isShown() {
    return (await this.query.$('dialog')) !== null;
  }
}