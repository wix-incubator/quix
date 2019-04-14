import {ElementHandle} from 'puppeteer';

export class ComponentTestkit {
  constructor(private readonly element: ElementHandle) {
    if (!element) {
      throw new Error('Got null element');
    }
  }

  protected async hook(hook: string, pseudoClass: string = '') {
    return this.element.$(`[data-hook="${hook}"]${pseudoClass}`);
  }

  protected async hooks(hook: string, pseudoClass: string = '') {
    return this.element.$$(`[data-hook="${hook}"]${pseudoClass}`);
  }
}