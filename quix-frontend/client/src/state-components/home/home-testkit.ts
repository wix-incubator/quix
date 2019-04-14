import {TestkitPage} from '../../../test/e2e/driver';

export class HomeTestkit {
  constructor (private readonly page: TestkitPage) {}

  async hasNotebooksAction() {
    return (await this.page.query.hook('home-notebooks')) !== null;
  }

  async hasAddNotebookAction() {
    return (await this.page.query.hook('home-add-notebook')) !== null;
  }

  async clickNotebooks() {
    return this.page.click.hook('home-notebooks');
  }

  async clickAddNotebook() {
    return this.page.click.hook('home-add-notebook');
  }
}