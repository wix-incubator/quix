import {expect} from 'chai';
import {Driver} from './driver';
import {createMockUser} from '../mocks';
import {UsersTestkit} from '../../src/state-components/users/users-testkit';

describe('Users ::', () => {
  let driver: Driver, testkit: UsersTestkit;

  const gotoErrorUsers = async () => {
    await driver.mock.http('/api/users', [404, {message: 'Failed to fetch users'}]);
    await driver.goto(`/users`);
  }

  const gotoEditableRootFolder = async (mock = [createMockUser()]) => {
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
    await gotoErrorUsers();

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display content', async () => {
    await gotoEditableRootFolder();

    expect(await testkit.hasContent()).to.be.true;
    expect(await testkit.numOfUsers()).to.equal(1);
  });
});
