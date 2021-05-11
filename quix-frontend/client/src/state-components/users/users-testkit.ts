import { TableTestkit } from '../../lib/ui/components/table/table-testkit';

const enum Hooks {
  Content = 'users-table',
  FilterUsersInput = 'users-filter-users-input',
}

export class UsersTestkit extends TableTestkit {

  usersTableExists = async () => {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  usersFilter = {
    click: () => {
      return this.click.hook(Hooks.FilterUsersInput);
    },

    set: (value: string) => {
      return this.keyboard.type(Hooks.FilterUsersInput, value);
    },

    get: () => {
      return this.evaluate.hook(Hooks.FilterUsersInput, (e: HTMLInputElement) => e.value);
    },
  }
}
