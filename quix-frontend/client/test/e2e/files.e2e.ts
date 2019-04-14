import {expect} from 'chai';
import {Driver} from './driver';
import {createMockFolder, createMockFile} from '../mocks';
import {FilesTestkit} from '../../src/state-components/files/files-testkit';

describe('Files ::', () => {
  let driver: Driver, testkit: FilesTestkit;

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = new FilesTestkit(driver.getTestkitPage());
  });

  it('should have one breadcrumb when user has no notebooks', async () => {
    await driver.mock.http('/api/files', []);
    await driver.goto('/files/');

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(1);
  });

  it('should display empty state when user has no notebooks', async () => {
    await driver.mock.http('/api/files', []);
    await driver.goto('/files/');

    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display a table when user has notebooks/files', async () => {
    await driver.mock.http('/api/files', [createMockFolder()]);
    await driver.goto('/files/');

    expect(await testkit.hasContent()).to.be.true;
  });

  it('should navigate to a notebook', async () => {
    const notebook = createMockFile();

    await driver.mock.http('/api/files', [notebook]);
    await driver.goto('/files/');
    await testkit.clickFile(1);

    expect(await driver.url.matches(`/notebook/${notebook.id}`)).to.be.true;
  });

  it('should create a folder and navigate to it', async () => {
    await driver.goto('/files/');
    await testkit.clickAddFolder();

    expect(await driver.url.matches('/files/:id')).to.be.true;
  });

  it('should focus the newly created folder name', async () => {
    await driver.goto('/files/');
    await testkit.clickAddFolder();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await breadcrumbsTestkit.isFileNameFocused()).to.be.true;
  });

  it('should create a notebook and navigate to it', async () => {
    await driver.goto('/files/');
    await testkit.clickAddNotebook();

    expect(await driver.url.matches('/notebook/:id')).to.be.true;
  });

  it('should focus the newly created notebook name', async () => {
    await driver.goto('/files/');
    await testkit.clickAddNotebook();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await breadcrumbsTestkit.isFileNameFocused()).to.be.true;
  });

  it('should navigate to the root after creating a folder and clicking the root folder', async () => {
    await driver.goto('/files/');
    await testkit.clickAddFolder();

    expect(await driver.url.matches('/files/:id')).to.be.true;

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();
    await breadcrumbsTestkit.clickFile(1);

    expect(await driver.url.matches('/files/')).to.be.true;
  });
});
