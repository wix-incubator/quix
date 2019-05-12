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

export class FilesTestkit extends Testkit {
  async getBreadcrumbsTestkit() {
    return new BreadcrumbsTestkit(await this.query.$('quix-breadcrumbs'));
  }

  async getActionsTestkit() {
    return new ActionsTestkit(await this.query.$('quix-actions'));
  }

  async hasEmptyState() {
    return (await this.query.hook(Hooks.Empty)) !== null;
  }

  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async clickAddFolder() {
    return this.click.hook(Hooks.AddFolder);
  }

  async clickAddNotebook() {
    return this.click.hook(Hooks.AddNotebook);
  }

  async clickFile(index) {
    return this.click.attr('bi-tbl-row', `:nth-child(${index})`);
  }

  async numOfFiles() {
    return (await this.query.attrs('bi-tbl-row')).length;
  }

  async isAddFolderEnabled() {
    return this.evaluate.hook(Hooks.AddFolder, el => !el.hasAttribute('disabled'));
  }

  async isAddNotebookEnabled() {
    return this.evaluate.hook(Hooks.AddNotebook, el => !el.hasAttribute('disabled'));
  }

  async isBulkSelectEnabled() {
    return this.evaluate.attr('bi-tbl-row', el => el.querySelector('[data-hook="files-mark-column"]') !== null);
  }
}