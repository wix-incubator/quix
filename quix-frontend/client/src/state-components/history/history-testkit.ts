import { Testkit } from '../../../test/e2e/driver';

const enum Hooks {
  Initial = 'history-initial',
  Error = 'history-error',
  Content = 'history-content',
  Result = 'history-result',
  TableRow = 'history-table-row',
  UserFilter = 'history-filter-user-select',
  UserFilterOption = 'history-filter-user-select-option',
  QueryFilter = 'history-filter-query-input',
}

export class HistoryTestkit extends Testkit {

  states = {
    hasErrorState: async () => {
      return (await this.query.hook(Hooks.Error)) !== null;
    },
    
    hasLoadingState: async () => {
      return (await this.query.hook(Hooks.Initial)) !== null;
    },

    hasResultState: async () => {
      return (await this.query.hook(Hooks.Result)) !== null;
    },
  
    hasContentState: async () => {
      return (await this.query.hook(Hooks.Content)) !== null;
    }
  }

  table = {
    rowNumbers: async () => {
      return (await this.query.hooks(Hooks.TableRow)).length;
    },
  }

  userFilter = {
    clickOnDropdown: async () => {
      await this.click.hook(Hooks.UserFilter);
    },

    clickOnOption: async () => {
      await this.click.hook(Hooks.UserFilterOption);
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
