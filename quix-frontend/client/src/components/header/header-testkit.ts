import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class HeaderTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }
}