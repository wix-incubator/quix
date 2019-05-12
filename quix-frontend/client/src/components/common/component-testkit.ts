import {Testkit} from '../../../test/e2e/driver';

export class ComponentTestkit extends Testkit {
  constructor(element: any) {
    super(element);

    if (!element) {
      throw new Error('Got null element');
    }
  }
}