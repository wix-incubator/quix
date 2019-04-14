import {ComponentTestkit} from '../common/component-testkit'
import {ElementHandle} from 'puppeteer';

export class BreadcrumbsTestkit extends ComponentTestkit {
  constructor(element: ElementHandle) {
    super(element);
  }

  async numOfFiles() {
    return (await this.hooks('file-name')).length;
  }

  async clickFile(index: number) {
    const file = (await this.hooks('file-name'))[index - 1];

    if (!file) {
      throw new Error(`No breadcrumbs file at index ${index}`);
    }

    return file.click();
  }

  async isFileNameFocused() {
    return (await this.hook('file-name', ':focus')) !== null;
  }
}