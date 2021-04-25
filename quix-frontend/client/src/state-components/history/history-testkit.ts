import { TableTestkit } from '../../lib/ui/components/sortable-table/table-testkit';

const enum Hooks {
  Content = 'table-history-content',
  UserFilter = 'history-filter-user-select',
  UserFilterOption = 'history-filter-user-select-option',
  QueryFilter = 'history-filter-query-input',
}

export class HistoryTestkit extends TableTestkit {

  historyTableExists = async () => {
    return (await this.query.hook(Hooks.Content)) !== null;
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
