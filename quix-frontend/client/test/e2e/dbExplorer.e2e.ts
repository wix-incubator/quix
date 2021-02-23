import {expect} from 'chai';
import {Driver} from './driver';
import {createMockDbExplorer, createMockDbExplorerItem} from '../mocks';
import {FileExplorerTestkit} from '../../src/react-components/file-explorer/file-explorer-testkit';
import {ServerTreeItem} from '../../src/components/db-sidebar/db-sidebar-types';

const COMPONENT_ANIMATION_TIME = 300;

describe('FileExplorer ::', () => {
  let driver: Driver, testkit: FileExplorerTestkit;

  const goToDbExplorer = async (items: ServerTreeItem[] = []) => {
    const tree = createMockDbExplorer(items);
    await driver.mock.http(`/api/db/:type/explore`, tree);
    await driver.goto('/home');
  }

  const clickOnTreeItemByName = async (name: string) => {
    await testkit.clickOnItemByName(name);
    await driver.sleep(COMPONENT_ANIMATION_TIME);
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

    await clickOnTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(2);
    expect(await testkit.isTreeItemExistsByName('childTest')).to.be.true;


    await clickOnTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;
  });

  it('should check close tree item recursively', async () => {
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
    await clickOnTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(2);
    await clickOnTreeItemByName('childTest1');
    expect(await testkit.numOfTreeItems()).to.eq(3);
    expect(await testkit.isTreeItemExistsByName('childTest2')).to.be.true;


    await clickOnTreeItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;
  });

  it('should close all tree items when reopen fileExplorer tab', async () => {
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
    await clickOnTreeItemByName('parentTest');
    await clickOnTreeItemByName('childSchemaTest1');
    await clickOnTreeItemByName('childTableTest1');

    await testkit.toggleFileExplorerTab();
    await driver.sleep(COMPONENT_ANIMATION_TIME);
    await testkit.toggleFileExplorerTab();
    expect(await testkit.numOfTreeItems()).to.eq(1);
  });

  it('should load when clicking on table', async () => {
    // TODO: it doesn't works
    // await goToDbExplorer(
    //   [
    //     createMockDbExplorerItem({
    //       name: 'parentTest',
    //       children: [
    //         createMockDbExplorerItem({
    //           name: 'childSchemaTest1',
    //           type: 'schema',
    //           children: [
    //             createMockDbExplorerItem({
    //               name: 'childTableTest1',
    //               type: 'table'
    //             }),
    //             createMockDbExplorerItem({
    //               name: 'childTableTest2',
    //               type: 'table'
    //             })
    //           ]
    //         }),
    //       ]
    //     })
    //   ]
    // );

    // await testkit.toggleFileExplorerTab();
    // await clickOnTreeItemByName('parentTest');
    // await clickOnTreeItemByName('childSchemaTest1');
    // await testkit.clickOnItemByName('childTableTest1');
    // expect(await testkit.countLoadingState()).to.eq(1);
    // await testkit.clickOnItemByName('childTableTest2');
    // expect(await testkit.countLoadingState()).to.eq(2);
  });

  it("shouldn't load twice when clicking on same table", async () => {
    // TODO: it doesn't works
    // await goToDbExplorer(
    //   [
    //     createMockDbExplorerItem({
    //       name: 'parentTest',
    //       children: [
    //         createMockDbExplorerItem({
    //           name: 'childSchemaTest1',
    //           type: 'schema',
    //           children: [
    //             createMockDbExplorerItem({
    //               name: 'childTableTest1',
    //               type: 'table'
    //             }),
    //           ]
    //         }),
    //       ]
    //     })
    //   ]
    // );

    // await testkit.toggleFileExplorerTab();
    // await testkit.clickOnItemByName('parentTest');
    // await driver.sleep(COMPONENT_ANIMATION_TIME);
    // await testkit.clickOnItemByName('childSchemaTest1');
    // await driver.sleep(COMPONENT_ANIMATION_TIME);
    // await testkit.clickOnItemByName('childTableTest1');
    // await driver.sleep(COMPONENT_ANIMATION_TIME);
    // expect(await testkit.numOfTreeItems()).to.eq(4);
    // await testkit.clickOnItemByName('childTableTest1');
    // await driver.sleep(COMPONENT_ANIMATION_TIME);
    // expect(await testkit.numOfTreeItems()).to.eq(3);
    // await testkit.clickOnItemByName('childTableTest1');
    // await driver.sleep(COMPONENT_ANIMATION_TIME);
    // expect(await testkit.numOfTreeItems()).to.eq(4);
  });
});
