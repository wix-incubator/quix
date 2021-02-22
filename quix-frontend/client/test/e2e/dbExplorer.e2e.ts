import {expect} from 'chai';
import {Driver} from './driver';
import {createMockDbExplorer, createMockDbExplorerItem} from '../mocks';
import {FileExplorerTestkit} from '../../src/react-components/file-explorer/file-explorer-testkit';
import {ServerTreeItem} from '../../src/components/db-sidebar/db-sidebar-types';

describe('FileExplorer ::', () => {
  let driver: Driver, testkit: FileExplorerTestkit;

  const goToDbExplorer = async (items: ServerTreeItem[] = []) => {
    const tree = createMockDbExplorer(items);
    await driver.mock.http(`/api/db/:type/explore`, tree);
    await driver.goto('/home');
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

    await testkit.clickOnItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(2);
    expect(await testkit.isTreeItemExistsByName('childTest')).to.be.true;


    await testkit.clickOnItemByName('parentTest');
    await driver.sleep(500);

    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;
  });

  it('should check close tree item works recursively', async () => {
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
    await testkit.clickOnItemByName('parentTest');
    expect(await testkit.numOfTreeItems()).to.eq(2);
    await driver.sleep(500);
    await testkit.clickOnItemByName('childTest1');
    await driver.sleep(500);
    expect(await testkit.numOfTreeItems()).to.eq(3);
    expect(await testkit.isTreeItemExistsByName('childTest2')).to.be.true;


    await testkit.clickOnItemByName('parentTest');
    await driver.sleep(500);
    expect(await testkit.numOfTreeItems()).to.eq(1);
    expect(await testkit.isTreeItemExistsByName('parentTest')).to.be.true;
  }); 
});
