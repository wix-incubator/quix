import {Testkit} from '../../../test/e2e/driver';

const enum Hooks {
  Error = 'table-error',
  Content = 'table-users-content',
  EmptyResult = 'table-empty-result',
  FilterInitial = 'table-filter-initial',
  TableRow = 'table-row',
  UsersFilter = 'users-filter-query-input',
}

export class UsersTestkit extends Testkit {

  states = {
    hasError: async () => {
      return (await this.query.hook(Hooks.Error)) !== null;
    },

    hasFilterLoading: async () => {
      return (await this.query.hook(Hooks.FilterInitial)) !== null;
    },

    hasEmptyResult: async () => {
      return (await this.query.hook(Hooks.EmptyResult)) !== null;
    },

    hasContent: async() => {
      return (await this.query.hook(Hooks.Content)) !== null;
    },
  }

  table = {
    totalRows: async () => {
      return (await this.query.hooks(Hooks.TableRow)).length;
    },
  }

  usersFilter = {
    click: () => {
      return this.click.hook(Hooks.UsersFilter);
    },

    set: (value: string) => {
      return this.keyboard.type(Hooks.UsersFilter, value);
    },

    get: () => {
      return this.evaluate.hook(Hooks.UsersFilter, (e: HTMLInputElement) => e.value);
    },
  }
}
