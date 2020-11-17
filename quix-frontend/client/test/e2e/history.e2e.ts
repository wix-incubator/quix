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

    expect(await testkit.states.hasErrorState()).to.be.true;
  });

  it('should display content', async () => {
    await gotoHistory();

    expect(await testkit.states.hasContentState()).to.be.true;
    expect(await testkit.table.rowNumbers()).to.equal(1);
  });

  it('should display user options', async () => {
    await gotoHistory();
    expect(await testkit.states.hasLoadingState()).to.be.true;
    
    await testkit.userFilter.clickOnDropdown();
    expect(await testkit.userFilter.hasOptions()).to.be.true;
  });

  it('should filter by user', async () => {
    await gotoHistory();
    expect(await testkit.states.hasContentState()).to.be.true;
    expect(await testkit.table.rowNumbers()).to.equal(1);
    
    driver.mock.reset();
    await testkit.userFilter.clickOnDropdown();
    await testkit.userFilter.clickOnOption();

    expect(await testkit.states.hasLoadingState()).to.be.true;
    expect(await testkit.states.hasContentState()).to.be.true;
    expect(await testkit.table.rowNumbers()).to.equal(100);
  });

  it('should filter by query', async () => {
    await gotoHistory();
    expect(await testkit.states.hasContentState()).to.be.true;
    expect(await testkit.table.rowNumbers()).to.equal(1);

    driver.mock.reset();
    await testkit.queryFilter.click();

    await testkit.queryFilter.set('example');
    expect(await testkit.states.hasLoadingState()).to.be.true;
    expect(await testkit.states.hasContentState()).to.be.true;
    expect(await testkit.table.rowNumbers()).to.equal(100);
  });
});
