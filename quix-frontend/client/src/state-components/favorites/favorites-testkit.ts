import {Testkit} from '../../../test/e2e/driver';

const enum Hooks {
  Error = 'favorites-error',
  Content = 'favorites-content'
}

export class FavoritesTestkit extends Testkit {
  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }

  async hasContent() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async numOfFavorites() {
    return (await this.query.hooks('table-row')).length;
  }
}
