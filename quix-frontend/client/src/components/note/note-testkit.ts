import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class NoteTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }

  async isNameFocused() {
    return (await this.query.hook('note-name', ':focus')) !== null;
  }
}