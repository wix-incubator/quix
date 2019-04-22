import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class TempQueryTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }
}