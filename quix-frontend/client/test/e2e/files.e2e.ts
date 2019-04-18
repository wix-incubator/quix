import {expect} from 'chai';
import {Driver} from './driver';
import {createMockFiles, createMockFile, createMockFolderPayload, createMockFolder} from '../mocks';
import {FilesTestkit} from '../../src/state-components/files/files-testkit';

describe('Files ::', () => {
  let driver: Driver, testkit: FilesTestkit;

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = new FilesTestkit(driver.getTestkitPage());
  });

  it('should display error state when failed to fetch files', async () => {
    await driver.mock.http('/api/files', [404, {message: 'Failed to fetch files'}]);
    await driver.goto(`/files/`);

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display error state when folder is not found', async () => {
    await driver.mock.http('/api/files/:id', [404, {message: 'Folder not found'}]);
    await driver.goto(`/files/1`);

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display empty state in root folder when user does not have folders/notebooks', async () => {
    await driver.mock.http('/api/files', createMockFiles());
    await driver.goto('/files/');

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(1);
    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display empty state when folder does not have folders/notebooks', async () => {
    await driver.mock.http('/api/files/:id', createMockFolderPayload());
    await driver.goto('/files/1');

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display content in root folder when user has folders/notebooks', async () => {
    await driver.mock.http('/api/files', createMockFiles([createMockFile()]));
    await driver.goto('/files/');

    expect(await testkit.hasContent()).to.be.true;
  });

  it('should display content when folder has folders/notebooks', async () => {
    await driver.mock.http('/api/files/:id', createMockFolderPayload([createMockFile()]));
    await driver.goto('/files/1');

    expect(await testkit.hasContent()).to.be.true;
  });

  it('should navigate to a notebook in the root folder', async () => {
    const files = createMockFiles([createMockFile()]);

    await driver.mock.http('/api/files', files);
    await driver.goto('/files/');
    await testkit.clickFile(1);

    expect(await driver.url.matches(`/notebook/${files[1].id}`)).to.be.true;
  });

  it('should navigate to a notebook in a folder', async () => {
    const folder = createMockFolderPayload([createMockFile()]);

    await driver.mock.http('/api/files/:id', folder);
    await driver.goto('/files/1');
    await testkit.clickFile(1);

    expect(await driver.url.matches(`/notebook/${folder.files[0].id}`)).to.be.true;
  });

  it('should navigate to a folder in the root folder', async () => {
    const files = createMockFiles([createMockFolder()]);

    await driver.mock.http('/api/files', files);
    await driver.goto('/files/');
    await testkit.clickFile(1);

    expect(await driver.url.matches(`/files/${files[1].id}`)).to.be.true;
  });

  it('should navigate to a folder in a folder', async () => {
    const folder = createMockFolderPayload([createMockFolder()]);

    await driver.mock.http('/api/files/:id', folder);
    await driver.goto('/files/1');
    await testkit.clickFile(1);

    expect(await driver.url.matches(`/files/${folder.files[0].id}`)).to.be.true;
  });

  it('should create a folder in a root folder', async () => {
    await driver.mock.http('/api/files', createMockFiles());
    await driver.goto('/files/');
    await testkit.clickAddFolder();

    expect(await testkit.numOfFiles()).to.equal(1);
  });

  it('should create a folder in a folder', async () => {
    await driver.mock.http('/api/files/:id', createMockFolderPayload());
    await driver.goto('/files/1');
    await testkit.clickAddFolder();

    expect(await testkit.numOfFiles()).to.equal(1);
  });

  it('should create a notebook in a root folder and navigate to it', async () => {
    await driver.goto('/files/');
    await testkit.clickAddNotebook();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await driver.url.matches('/notebook/:id')).to.be.true;
  });

  it('should create a notebook in a folder and navigate to it', async () => {
    await driver.goto('/files/1');
    await testkit.clickAddNotebook();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await driver.url.matches('/notebook/:id')).to.be.true;
  });

  it('should navigate to the root after navigating to a folder and clicking the root folder', async () => {
    await driver.goto('/files/');
    await testkit.clickFile(1);

    expect(await driver.url.matches('/files/:id')).to.be.true;

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();
    await breadcrumbsTestkit.clickFile(1);

    expect(await driver.url.matches('/files/')).to.be.true;
  });
});
