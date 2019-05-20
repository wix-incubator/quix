import {Testkit} from '../../../test/e2e/driver';
import {BreadcrumbsTestkit} from '../../components/breadcrumbs/breadcrumbs-testkit';
import {ActionsTestkit} from '../../components/actions/actions-testkit';

const enum Hooks {
  Empty = 'users-empty',
  Error = 'users-error',
  Content = 'users-content',
  AddFolder = 'users-add-folder',
  AddNotebook = 'users-add-notebook',
}

export class FilesTestkit extends Testkit {
  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async numOfUsers() {
    return (await this.query.attrs('bi-tbl-row')).length;
  }
}