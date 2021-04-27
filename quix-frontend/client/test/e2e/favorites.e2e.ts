import {expect} from 'chai';
import {Driver} from './driver';
import {createMockFile} from '../mocks';
import {FavoritesTestkit} from '../../src/state-components/favorites/favorites-testkit';

describe('Favorites ::', () => {
  let driver: Driver, testkit: FavoritesTestkit;

  const gotoFavoritesWithError = async () => {
    await driver.mock.http('/api/favorites', [404, {message: 'Failed to fetch favorites'}]);
    await driver.goto(`/favorites`);
  }

  const gotoFavorites = async (mock = [createMockFile()]) => {
    await driver.mock.http('/api/favorites', mock);
    await driver.goto('/favorites');

    return mock;
  }

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(FavoritesTestkit);
  });

  it('should display error state when failed to fetch favorites', async () => {
    await gotoFavoritesWithError();

    expect(await testkit.tableStates.hasError()).to.be.true;
  });

  it('should display empty state', async () => {
    await gotoFavorites([]);

    expect(await testkit.tableStates.hasEmptyResult()).to.be.true;
  });

  it('should display content', async () => {
    await gotoFavorites();

    expect(await testkit.favoritesTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(1);
  });
});
