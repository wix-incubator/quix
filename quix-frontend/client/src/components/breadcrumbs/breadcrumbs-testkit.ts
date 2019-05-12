import {Testkit} from '../../../test/e2e/driver';

export class BreadcrumbsTestkit extends Testkit {
  async numOfFiles() {
    return (await this.query.hooks('file-name')).length;
  }

  async clickFile(index: number) {
    const file = (await this.query.hooks('file-name'))[index - 1];

    if (!file) {
      throw new Error(`No breadcrumbs file at index ${index}`);
    }

    return file.click();
  }

  async isFileNameFocused() {
    return (await this.query.hook('file-name', ':focus')) !== null;
  }

  async isFileNameEditable() {
    return this.evaluate.hooks('file-name', els => els[els.length - 1].getAttribute('contenteditable') === 'true');
  }
}
