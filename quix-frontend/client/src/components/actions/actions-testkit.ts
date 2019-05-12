import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

const enum Hooks {
  Delete = 'actions-delete',
}

export class ActionsTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }

  async isDeleteEnabled() {
    return (await this.query.hook(Hooks.Delete)) !== null;
  }
}