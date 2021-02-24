import {expect} from 'chai';
import {Driver} from './driver';
import {createMockDbExplorer, createMockDbExplorerItem} from '../mocks';
import {FileExplorerTestkit} from '../../src/react-components/file-explorer/file-explorer-testkit';
import {ServerTreeItem} from '../../src/components/db-sidebar/db-sidebar-types';

const COMPONENT_ANIMATION_TIME = 350;

describe('FileExplorer ::', () => {
  let driver: Driver, testkit: FileExplorerTestkit;

  const goToDbExplorer = async (items: ServerTreeItem[] = [], delay = 0) => {
    const tree = createMockDbExplorer(items);

    await driver.mock.http(`/api/db/:type/explore`, tree, {delay});
    await driver.mock.http(`/api/db/:type/search`, tree, {delay});
    await driver.goto('/home');
  }

  const mockTableResponse = async (tableName: string, delay = 0) => {
    const columns = {
      children: [{
        dataType: 'varchar',
        name: 'column_of_' + tableName
      }]
    }
    await driver.mock.http(`/api/db/:type/explore/:catalog/:schema/:table`, columns, {delay})
  }

  const ToggleTreeItemByName = async (name: string, wait = true) => {
    await testkit.clickOnItemByName(name);
    if (wait) {
      await driver.sleep(COMPONENT_ANIMATION_TIME);
    }
  }

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(FileExplorerTestkit);
  });

  it('should display tree', async () => {
    await goToDbExplorer([createMockDbExplorerItem({name: 'test'})]);

    await testkit.toggleFileExplorerTab();
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('test')).to.be.true;
  });

  it('should check toggle tree item works', async () => {
    await goToDbExplorer(
      [
        createMockDbExplorerItem({
          name: 'parentTest',
          children: [
            createMockDbExplorerItem({
              name: 'childTest',
              type: 'schema'
            })
          ]
        })
      ]
    );

    await testkit.toggleFileExplorerTab();
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;

    await ToggleTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(2);
    expect(await testkit.isTreeItemExistsByName('childTest')).to.be.true;


    await ToggleTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;
  });

  it('should check toggle tree item recursively', async () => {
    await goToDbExplorer(
      [
        createMockDbExplorerItem({
          name: 'parentTest',
          children: [
            createMockDbExplorerItem({
              name: 'childTest1',
              type: 'schema',
              children: [
                createMockDbExplorerItem({
                  name: 'childTest2',
                  type: 'table'
                })
              ]
            }),
          ]
        })
      ]
    );

    await testkit.toggleFileExplorerTab();
    await ToggleTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(2);
    await ToggleTreeItemByName('childTest1');
    expect(await testkit.numOfTreeItems()).to.eq(3);
    expect(await testkit.isTreeItemExistsByName('childTest2')).to.be.true;

    await ToggleTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;
  });

  it('should close all tree items when reopening fileExplorer tab', async () => {
    await goToDbExplorer(
      [
        createMockDbExplorerItem({
          name: 'parentTest',
          children: [
            createMockDbExplorerItem({
              name: 'childSchemaTest1',
              type: 'schema',
              children: [
                createMockDbExplorerItem({
                  name: 'childTableTest1',
                  type: 'table'
                }),
              ]
            }),
          ]
        })
      ]
    );

    await testkit.toggleFileExplorerTab();
    await ToggleTreeItemByName('parentTest');
    await ToggleTreeItemByName('childSchemaTest1');
    await ToggleTreeItemByName('childTableTest1');

    await testkit.toggleFileExplorerTab();
    await driver.sleep(COMPONENT_ANIMATION_TIME);
    await testkit.toggleFileExplorerTab();
    expect(await testkit.numOfTreeItems()).to.eq(1);
  });

  it('should load when clicking on table', async () => {
    await goToDbExplorer(
      [
        createMockDbExplorerItem({
          name: 'parentTest',
          children: [
            createMockDbExplorerItem({
              name: 'childSchemaTest1',
              type: 'schema',
              children: [
                createMockDbExplorerItem({
                  name: 'childTableTest1',
                  type: 'table'
                }),
                createMockDbExplorerItem({
                  name: 'childTableTest2',
                  type: 'table'
                })
              ]
            }),
          ]
        })
      ]
    );

    mockTableResponse('childTableTest1', 1000);
    mockTableResponse('childTableTest2', 1000);

    await testkit.toggleFileExplorerTab();
    await ToggleTreeItemByName('parentTest');
    await ToggleTreeItemByName('childSchemaTest1');
    await ToggleTreeItemByName('childTableTest1');
    expect(await testkit.numOfLoadingTreeItems()).to.eq(1);
    await ToggleTreeItemByName('childTableTest2');
    expect(await testkit.numOfLoadingTreeItems()).to.eq(2);
  });

  it("shouldn't load twice when clicking on same table", async () => {
    await goToDbExplorer(
      [
        createMockDbExplorerItem({
          name: 'parentTest',
          children: [
            createMockDbExplorerItem({
              name: 'childSchemaTest1',
              type: 'schema',
              children: [
                createMockDbExplorerItem({
                  name: 'childTableTest1',
                  type: 'table'
                }),
              ]
            }),
          ]
        })
      ]
    );

    await testkit.toggleFileExplorerTab();
    await ToggleTreeItemByName('parentTest');
    await ToggleTreeItemByName('childSchemaTest1');
    await ToggleTreeItemByName('childTableTest1');
    expect(await testkit.numOfTreeItems()).to.eq(4);
    await ToggleTreeItemByName('childTableTest1');

    mockTableResponse('childTableTest1', 10000);
    await ToggleTreeItemByName('childTableTest1', false);
    expect(await testkit.numOfOpenedTreeItems()).to.eq(3);
  });

  it('should expand all tree items after searching', async () => {
    await goToDbExplorer(
      [
        createMockDbExplorerItem({
          name: 'parentTest',
          children: [
            createMockDbExplorerItem({
              name: 'childTest1',
              type: 'schema',
              children: [
                createMockDbExplorerItem({
                  name: 'childTest2',
                  type: 'table'
                })
              ]
            }),
          ]
        })
      ]
    );

    await testkit.toggleFileExplorerTab();
    await driver.sleep(COMPONENT_ANIMATION_TIME);
    await testkit.search('bla');
    await driver.sleep(2 * COMPONENT_ANIMATION_TIME);
    expect(await testkit.numOfTreeItems()).to.eq(4); // 3 visible and 1 hidden by angular
  });
});
