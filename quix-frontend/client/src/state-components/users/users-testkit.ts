import { TableTestkit } from '../../lib/ui/components/sortable-table/table-testkit';

const enum Hooks {
  Content = 'table-users-content',
  UsersFilter = 'users-filter-query-input',
}

export class UsersTestkit extends TableTestkit {

  usersTableExists = async () => {
    return (await this.query.hook(Hooks.Content)) !== null;
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
