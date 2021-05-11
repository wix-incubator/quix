import { TableTestkit } from '../../lib/ui/components/table/table-testkit';

const enum Hooks {
  Table = 'favorites-table'
}

export class FavoritesTestkit extends TableTestkit {

  favoritesTableExists = async () => {
    return (await this.query.hook(Hooks.Table)) !== null;
  }
}
