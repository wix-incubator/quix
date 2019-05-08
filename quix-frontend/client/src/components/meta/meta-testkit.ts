import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class ActionsTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }
}