import { Testkit } from '../../../test/e2e/driver';

const enum Hooks {
  Error = 'history-error',
  Content = 'history-content',
  UserFilter = 'history-filter-user-select',
  UserFilterOptions = 'history-filter-user-select-options',
  QueryFilter = 'history-filter-query-input',
}

export class HistoryTestkit extends Testkit {
  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async numOfHistory() {
    return (await this.query.hooks('table-row')).length;
  }

  async ClickOnUserFilter() {
    (await this.query.hook(Hooks.UserFilter)).click();
  }
  
  async hasOptionsUserFilter() {
    return (await this.query.hook(Hooks.UserFilterOptions)) !== null;
  }

  async setAllUserFilter() {
    await this.evaluate.hook(Hooks.UserFilter, (e: HTMLInputElement) => e.value = 'All users');
  }

  getUserFilter() {
    return this.evaluate.hook(Hooks.UserFilter, (e: HTMLInputElement) => e.value);
  }

  async setQueryFilter() {
    await this.evaluate.hook(Hooks.QueryFilter, (e: HTMLInputElement) => e.value = 'example');
  }

  getQueryFilter() {
    return this.evaluate.hook(Hooks.QueryFilter, (e: HTMLInputElement) => e.value);
  }
}
