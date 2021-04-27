import { TableTestkit } from '../../lib/ui/components/table/table-testkit';

const enum Hooks {
  Table = 'history-table',
  UserFilterSelect = 'history-filter-user-select',
  UserFilterSelectOption = 'history-filter-user-select-option',
  QueryFilterInput = 'history-filter-query-input',
}

export class HistoryTestkit extends TableTestkit {

  historyTableExists = async () => {
    return (await this.query.hook(Hooks.Table)) !== null;
  }

  userFilter = {
    clickOnDropdown: () => {
      return this.click.hook(Hooks.UserFilterSelect);
    },

    clickOnOption: () => {
      return this.click.hook(Hooks.UserFilterSelectOption);
    },

    hasOptions: async () => {
      return (await this.query.hooks(Hooks.UserFilterSelectOption)).length > 0;
    },

    value: () => {
      return this.evaluate.hook(Hooks.UserFilterSelect, (e: HTMLInputElement) => e.value);
    },
  }

  queryFilter = {
    click: () => {
      return this.click.hook(Hooks.QueryFilterInput);
    },

    set: (value: string) => {
      return this.keyboard.type(Hooks.QueryFilterInput, value);
    },

    get: () => {
      return this.evaluate.hook(Hooks.QueryFilterInput, (e: HTMLInputElement) => e.value);
    },
  }
}
