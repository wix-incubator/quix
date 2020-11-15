import {expect} from 'chai';
import {Driver} from './driver';
import {createMockHistory} from '../mocks';
import {HistoryTestkit} from '../../src/state-components/history/history-testkit';

describe('History ::', () => {
  let driver: Driver, testkit: HistoryTestkit;

  const gotoHistoryWithError = async () => {
    await driver.mock.http('/api/history', [404, { message: 'Failed to fetch history' }]);
    await driver.goto(`/history`);
  }

  const gotoHistory = async (mock = [createMockHistory()]) => {
    await driver.mock.http('/api/history', mock);
    await driver.goto('/history');

    return mock;
  }
  
  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(HistoryTestkit);
  });

  it('should display error state when failed to fetch history', async () => {
    await gotoHistoryWithError();

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display content', async () => {
    await gotoHistory();

    expect(await testkit.hasContent()).to.be.true;
    expect(await testkit.numOfHistory()).to.equal(1);
  });

  it('should display user options', async () => {
    await gotoHistory();

    await testkit.ClickOnUserFilter();
    expect(await testkit.hasOptionsUserFilter()).to.be.true;
  });

  it('should filter by user', async () => {
    await gotoHistory();
    await testkit.setAllUserFilter();

    expect(await testkit.getUserFilter()).to.equal('All users');
  });

  it('should filter by query', async () => {
    await gotoHistory();
    await testkit.setQueryFilter();

    expect(await testkit.getQueryFilter()).to.equal('example');
  });
});
