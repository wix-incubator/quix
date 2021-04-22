import { Testkit } from '../../../test/e2e/driver';

const enum Hooks {
  Initial = 'table-initial',
  FilterInitial = 'table-filter-initial',
  Error = 'table-error',
  Content = 'table-history-content',
  EmptyResult = 'table-empty-result',
  TableRow = 'table-row',
  UserFilter = 'history-filter-user-select',
  UserFilterOption = 'history-filter-user-select-option',
  QueryFilter = 'history-filter-query-input',
}

export class HistoryTestkit extends Testkit {

  states = {
    hasError: async () => {
      return (await this.query.hook(Hooks.Error)) !== null;
    },
    
    hasLoading: async () => {
      return (await this.query.hook(Hooks.Initial)) !== null;
    },

    hasFilterLoading: async () => {
      return (await this.query.hook(Hooks.FilterInitial)) !== null;
    },
  
    hasEmptyResult: async () => {
      return (await this.query.hook(Hooks.EmptyResult)) !== null;
    },

    hasContent: async () => {
      return (await this.query.hook(Hooks.Content)) !== null;
    }
  }

  table = {
    totalRows: async () => {
      return (await this.query.hooks(Hooks.TableRow)).length;
    },
  }

  userFilter = {
    clickOnDropdown: () => {
      return this.click.hook(Hooks.UserFilter);
    },

    clickOnOption: () => {
      return this.click.hook(Hooks.UserFilterOption);
    },

    hasOptions: async () => {
      return (await this.query.hooks(Hooks.UserFilterOption)).length > 0;
    },

    value: () => {
      return this.evaluate.hook(Hooks.UserFilter, (e: HTMLInputElement) => e.value);
    },
  }

  queryFilter = {
    click: () => {
      return this.click.hook(Hooks.QueryFilter);
    },

    set: (value: string) => {
      return this.keyboard.type(Hooks.QueryFilter, value);
    },

    get: () => {
      return this.evaluate.hook(Hooks.QueryFilter, (e: HTMLInputElement) => e.value);
    },
  }
}
