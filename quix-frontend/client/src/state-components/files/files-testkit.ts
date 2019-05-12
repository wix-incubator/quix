import {Testkit} from '../../../test/e2e/driver';
import {BreadcrumbsTestkit} from '../../components/breadcrumbs/breadcrumbs-testkit';
import {ActionsTestkit} from '../../components/actions/actions-testkit';

const enum Hooks {
  Empty = 'files-empty',
  Error = 'files-error',
  Content = 'files-content',
  AddFolder = 'files-add-folder',
  AddNotebook = 'files-add-notebook',
}

export class FilesTestkit {
  constructor (private readonly page: Testkit) {}

  async getBreadcrumbsTestkit() {
    return new BreadcrumbsTestkit(await this.page.query.$('quix-breadcrumbs'));
  }

  async getActionsTestkit() {
    return new ActionsTestkit(await this.page.query.$('quix-actions'));
  }

  async hasEmptyState() {
    return (await this.page.query.hook(Hooks.Empty)) !== null;
  }

  async hasErrorState() {
    return (await this.page.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.page.query.hook(Hooks.Content)) !== null;
  }

  async clickAddFolder() {
    return this.page.click.hook(Hooks.AddFolder);
  }

  async clickAddNotebook() {
    return this.page.click.hook(Hooks.AddNotebook);
  }

  async clickFile(index) {
    return this.page.click.attr('bi-tbl-row', `:nth-child(${index})`);
  }

  async numOfFiles() {
    return (await this.page.query.attrs('bi-tbl-row')).length;
  }

  async isAddFolderEnabled() {
    return this.page.evaluate.hook(Hooks.AddFolder, el => !el.hasAttribute('disabled'));
  }

  async isAddNotebookEnabled() {
    return this.page.evaluate.hook(Hooks.AddNotebook, el => !el.hasAttribute('disabled'));
  }

  async isBulkSelectEnabled() {
    return this.page.evaluate.attr('bi-tbl-row', el => el.querySelector('[data-hook="files-mark-column"]') !== null);
  }
}