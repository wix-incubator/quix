import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class FilesSidebarTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }
}