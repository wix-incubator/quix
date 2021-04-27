import { TableTestkit } from '../../lib/ui/components/table/table-testkit';

const enum Hooks {
  Content = 'favorites-content'
}

export class FavoritesTestkit extends TableTestkit {

  favoritesTableExists = async () => {
    return (await this.query.hook(Hooks.Content)) !== null;
  }
}
