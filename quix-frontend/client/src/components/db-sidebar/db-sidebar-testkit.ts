import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class DbSidebarTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }
}