import {Testkit} from '../../../test/e2e/driver';

export class HomeTestkit extends Testkit {
  async hasNotebooksAction() {
    return (await this.query.hook('home-notebooks')) !== null;
  }

  async hasAddNotebookAction() {
    return (await this.query.hook('home-add-notebook')) !== null;
  }

  async clickNotebooks() {
    return this.click.hook('home-notebooks');
  }

  async clickExamples() {
    return this.click.hook('home-examples');
  }

  async clickAddNotebook() {
    return this.click.hook('home-add-notebook');
  }
}