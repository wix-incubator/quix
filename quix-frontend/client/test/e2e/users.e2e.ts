import {expect} from 'chai';
import {IUser} from '@wix/quix-shared';
import {Driver} from './driver';
import {createMockUser} from '../mocks';
import {UsersTestkit} from '../../src/state-components/users/users-testkit';

describe('Users ::', () => {
  let driver: Driver, testkit: UsersTestkit;

  const gotoUsersWithError = async () => {
    await driver.mock.http('/api/users', [404, {message: 'Failed to fetch users'}]);
    await driver.goto(`/users`);
  }

  const gotoUsers = async (mock: Partial<IUser>[] = [createMockUser()]) => {
    await driver.mock.http('/api/users', mock);
    await driver.goto('/users');

    return mock;
  }

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(UsersTestkit);
  });

  it('should display error state when failed to fetch users', async () => {
    await gotoUsersWithError();

    expect(await testkit.tableStates.hasError()).to.be.true;
  });

  it('should display content', async () => {
    await gotoUsers();

    expect(await testkit.usersTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(1);
  });

  it('should display empty result', async () => {
    await gotoUsers([]);

    expect(await testkit.tableStates.hasEmptyResult()).to.be.true;
  });

  it('should filter by users', async () => {
    await gotoUsers([
      {email: 'email0@bla.bla'},
      {email: 'email1@bla.bla'},
      {email: 'email2@bla.bla'},
    ]);

    expect(await testkit.usersTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(3);

    await driver.mock.reset();
    await testkit.usersFilter.click();

    await testkit.usersFilter.set('1');
    expect(await testkit.tableStates.hasFilterLoading()).to.be.true;
    expect(await testkit.usersTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(1);
  });
});
