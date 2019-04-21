import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class DestinationTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }
}