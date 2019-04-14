import {TestkitPage} from '../../../test/e2e/driver';
import {BreadcrumbsTestkit} from '../../components/breadcrumbs/breadcrumbs-testkit';

export class FilesTestkit {
  constructor (private readonly page: TestkitPage) {}

  async getBreadcrumbsTestkit() {
    return new BreadcrumbsTestkit(await this.page.query.$('quix-breadcrumbs'));
  }

  async hasEmptyState() {
    return (await this.page.query.hook('files-empty')) !== null;
  }

  async hasContent() {
    return (await this.page.query.hook('files-content')) !== null;
  }

  async clickAddFolder() {
    return this.page.click.hook('files-add-folder');
  }

  async clickAddNotebook() {
    return this.page.click.hook('files-add-notebook');
  }

  async clickFile(index) {
    return this.page.click.attr('bi-tbl-row', `:nth-child(${index})`);
  }
}