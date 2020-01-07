import {expect} from 'chai';
import {Driver} from './driver';
import {createMockFiles, createMockFile, createMockFolderPayload, createMockFolder} from '../mocks';
import {FilesTestkit} from '../../src/state-components/files/files-testkit';

describe('Files ::', () => {
  let driver: Driver, testkit: FilesTestkit;

  const gotoErrorFiles = async () => {
    await driver.mock.http('/api/files', [404, {message: 'Failed to fetch files'}]);
    await driver.goto(`/files/`);
  }

  const gotoErrorFolder = async () => {
    await driver.mock.http('/api/files/:id', [404, {message: 'Folder not found'}]);
    await driver.goto(`/files/1`);
  }

  const gotoEditableRootFolder = async (files = [createMockFolder(), createMockFile()]) => {
    const mock = createMockFiles(files);

    await driver.mock.http('/api/files', mock);
    await driver.goto('/files/');

    return mock;
  }

  const gotoEditableFolder = async (files = [createMockFolder(), createMockFile()]) => {
    const mock = createMockFolderPayload(files);

    await driver.mock.http('/api/files/:id', mock);
    await driver.goto('/files/1');

    return mock;
  }

  const gotoReadonlyFolder = async (files = [createMockFolder(), createMockFile()]) => {
    const mock = createMockFolderPayload(files, {owner: 'readonly@quix.com'});

    await driver.mock.http('/api/files/:id', mock);
    await driver.goto('/files/1');

    return mock;
  }

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(FilesTestkit);
  });

  it('should display error state when failed to fetch files', async () => {
    await gotoErrorFiles();

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display error state when folder is not found', async () => {
    await gotoErrorFolder();

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display empty state in root folder when user does not have folders/notebooks', async () => {
    await gotoEditableRootFolder([]);

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(1);
    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display empty state when folder does not have folders/notebooks', async () => {
    await gotoEditableFolder([]);

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display content in root folder when user has folders/notebooks', async () => {
    await gotoEditableRootFolder();

    expect(await testkit.hasContent()).to.be.true;
  });

  it('should display content when folder has folders/notebooks', async () => {
    await gotoEditableFolder();

    expect(await testkit.hasContent()).to.be.true;
  });

  it('should navigate to a notebook in the root folder', async () => {
    const files = await gotoEditableRootFolder();

    await testkit.clickFile(2);

    expect(await driver.url.matches(`/notebook/${files[2].id}`)).to.be.true;
  });

  it('should navigate to a notebook in a folder', async () => {
    const folder = await gotoEditableFolder();

    await testkit.clickFile(2);

    expect(await driver.url.matches(`/notebook/${folder.files[1].id}`)).to.be.true;
  });

  it('should navigate to a folder in the root folder', async () => {
    const files = await gotoEditableRootFolder();

    await testkit.clickFile(1);

    expect(await driver.url.matches(`/files/${files[1].id}`)).to.be.true;
  });

  it('should navigate to a folder in a folder', async () => {
    const folder = await gotoEditableFolder();

    await testkit.clickFile(1);

    expect(await driver.url.matches(`/files/${folder.files[0].id}`)).to.be.true;
  });

  it('should create a folder in a root folder', async () => {
    await gotoEditableRootFolder([]);

    await testkit.clickAddFolder();

    expect(await testkit.numOfFiles()).to.equal(1);
  });

  it('should create a folder in a folder', async () => {
    await gotoEditableFolder([]);

    await testkit.clickAddFolder();

    expect(await testkit.numOfFiles()).to.equal(1);
  });

  it('should create a notebook in a root folder and navigate to it', async () => {
    await gotoEditableRootFolder([]);

    await testkit.clickAddNotebook();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await driver.url.matches('/notebook/:id')).to.be.true;
  });

  it('should create a notebook in a folder and navigate to it', async () => {
    await gotoEditableFolder([]);

    await testkit.clickAddNotebook();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

    expect(await breadcrumbsTestkit.numOfFiles()).to.equal(2);
    expect(await driver.url.matches('/notebook/:id')).to.be.true;
  });

  it('should navigate to the root after navigating to a folder and clicking the root folder', async () => {
    await gotoEditableRootFolder();

    await testkit.clickFile(1);

    expect(await driver.url.matches('/files/:id')).to.be.true;

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();
    await breadcrumbsTestkit.clickFile(1);

    expect(await driver.url.matches('/files/')).to.be.true;
  });

  describe('Permissions ::', () => {
    describe('Name ::', () => {
      it('should allow to edit name if user is owner', async () => {
        await gotoEditableFolder();

        const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

        expect(await breadcrumbsTestkit.isFileNameEditable()).to.be.true;
      });

      it('should not allow to edit name if user is not owner', async () => {
        await gotoReadonlyFolder();

        const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

        expect(await breadcrumbsTestkit.isFileNameEditable()).to.be.false;
      });
    });

    describe('Add folder | Add notebook ::', () => {
      it('should enable "Add folder" and "Add notebook" buttons if user is owner', async () => {
        await gotoEditableFolder();

        expect(await testkit.isAddFolderEnabled()).to.be.true;
        expect(await testkit.isAddNotebookEnabled()).to.be.true;
      });

      it('should disable "Add folder" and "Add notebook" buttons if user is not owner', async () => {
        await gotoReadonlyFolder();

        expect(await testkit.isAddFolderEnabled()).to.be.false;
        expect(await testkit.isAddNotebookEnabled()).to.be.false;
      });
    });

    describe('Delete ::', () => {
      it('should enable the delete action if user is owner', async () => {
        await gotoEditableFolder();

        const actionsTestkit = await testkit.getActionsTestkit();

        expect(await actionsTestkit.isDeleteEnabled()).to.be.true;
      });

      it('should disable the delete action if user is not owner', async () => {
        await gotoReadonlyFolder();

        const actionsTestkit = await testkit.getActionsTestkit();

        expect(await actionsTestkit.isDeleteEnabled()).to.be.false;
      });
    });

    describe('Bulk select ::', () => {
      it('should enable bulk selection if user is owner', async () => {
        await gotoEditableFolder();

        expect(await testkit.isBulkSelectEnabled()).to.be.true;
      });

      it('should disable bulk selection if user is not owner', async () => {
        await gotoReadonlyFolder();

        expect(await testkit.isBulkSelectEnabled()).to.be.false;
      });
    });
  });

  describe('Synchronization ::', () => {
    const createNotebookEvents = [
      { "event": "action", "data": { "type": "notebook.create", "notebook": { "id": "bfeeabd8-e69d-4380-8bb7-25f18e92855f", "name": "New notebook", "notes": [], "isLiked": false, "path": [{ "id": "c682d9db-2028-4fea-a5a9-eafa1fa58314", "name": "My notebooks" }], "owner": "user@quix.com", "ownerDetails": { "id": "", "name": "", "email": "", "avatar": "", "rootFolder": "", "dateCreated": 0, "dateUpdated": 0 }, "dateCreated": 1577967426084, "dateUpdated": 1577967426084 }, "id": "bfeeabd8-e69d-4380-8bb7-25f18e92855f" } },
      { "event": "action", "data": { "type": "note.create", "id": "c5ef5489-6ad2-44f6-b76f-ac2864f0db79", "note": { "id": "c5ef5489-6ad2-44f6-b76f-ac2864f0db79", "notebookId": "bfeeabd8-e69d-4380-8bb7-25f18e92855f", "name": "New note", "type": "presto", "content": "\n", "owner": "", "dateCreated": 1577967426084, "dateUpdated": 1577967426084 } } }
    ];    

    it('should subscribe to event sourcing mechanism', async function() {
      await gotoEditableRootFolder([]);
      expect(await testkit.hasEmptyState()).to.be.true;

      await driver.mock.wsBroadcast(createNotebookEvents);
      expect(await testkit.hasContent()).to.be.true;
    });
  })
});
