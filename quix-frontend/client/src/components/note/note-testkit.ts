import {Testkit} from '../../../test/e2e/driver';

export class NoteTestkit extends Testkit {
  async isNameFocused() {
    return (await this.query.hook('note-name', ':focus')) !== null;
  }
}