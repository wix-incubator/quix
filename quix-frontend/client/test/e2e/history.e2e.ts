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
  }

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(HistoryTestkit);
  });

  it('should display error state when failed to fetch history', async () => {
    await gotoHistoryWithError();

    expect(await testkit.tableStates.hasError()).to.be.true;
  });

  it('should display content', async () => {
    await gotoHistory();

    expect(await testkit.historyTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(1);
  });

  it('should display empty result', async () => {
    await gotoHistory([]);

    expect(await testkit.tableStates.hasEmptyResult()).to.be.true;
  });

  it('should display user options', async () => {
    await gotoHistory();
    expect(await testkit.tableStates.hasLoading()).to.be.true;
    
    await testkit.userFilter.clickOnDropdown();
    expect(await testkit.userFilter.hasOptions()).to.be.true;
  });

  it('should filter by user', async () => {
    await gotoHistory();
    expect(await testkit.historyTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(1);
    
    await driver.mock.reset();
    await testkit.userFilter.clickOnDropdown();
    await testkit.userFilter.clickOnOption();

    expect(await testkit.tableStates.hasFilterLoading()).to.be.true;
    expect(await testkit.historyTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(100);
  });

  it('should filter by query', async () => {
    await gotoHistory();
    expect(await testkit.historyTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(1);

    await driver.mock.reset();
    await testkit.queryFilter.click();

    await testkit.queryFilter.set('example');
    expect(await testkit.tableStates.hasFilterLoading()).to.be.true;
    expect(await testkit.historyTableExists()).to.be.true;
    expect(await testkit.tableTotalRows()).to.equal(100);
  });
});
