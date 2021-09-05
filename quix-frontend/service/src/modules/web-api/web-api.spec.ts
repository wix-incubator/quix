/* tslint:disable:no-non-null-assertion */
import { FileType } from '@wix/quix-shared';
import { range } from 'lodash';

import { EntityType } from '../../common/entity-type.enum';
import { WebApiDriver } from './web-api.driver';

jest.setTimeout(60000);

describe('web-api module :: ', () => {
  let driver: WebApiDriver;
  const defaultUser = 'foo@wix.com';

  beforeAll(async () => {
    driver = await WebApiDriver.create(defaultUser);
  });

  beforeEach(async () => await driver.clearDb());
  afterAll(() => driver.module.close());

  describe('foldersService :: ', () => {
    describe('getPathList', () => {
      it('get a path list with notebooks inside a folder', async () => {
        await driver.userRepo.save({
          id: defaultUser,
          name: 'some name',
          avatar: 'http://url',
          rootFolder: 'someId',
        });

        const notebookName = 'some new notebook';
        const [notebookNode, notebook] = driver.createNotebookNode(
          defaultUser,
          notebookName,
        );
        const folderNode = driver.createFolderNode(defaultUser, 'folderName');
        await driver.fileTreeRepo.save(folderNode);
        notebookNode.parent = folderNode;

        await driver.notebookRepo.save(notebook);
        await driver.fileTreeRepo.save(notebookNode);
        const list = await driver.folderService.getFilesForUser(defaultUser);

        expect(list!.find(i => i.id === notebook.id)!).toMatchObject({
          id: notebook.id,
          name: notebookName,
          path: [{ name: 'folderName' }],
        });
      });

      it('get a path list, multiple items in root', async () => {
        const notebookName = 'some new notebook';
        const [notebookNode, notebook] = driver.createNotebookNode(
          defaultUser,
          notebookName,
        );
        const folderNode = driver.createFolderNode(defaultUser, 'folderName');

        await driver.fileTreeRepo.save(folderNode);
        await driver.notebookRepo.save(notebook);
        await driver.fileTreeRepo.save(notebookNode);

        const list = await driver.folderService.getFilesForUser(defaultUser);
        expect(list).toHaveLength(2);
      });

      it('get a path list, starting from a specific folder', async () => {
        const notebookName = 'some new notebook';
        const [notebookNode, notebook] = driver.createNotebookNode(
          defaultUser,
          notebookName,
        );
        const parentFolderNode = driver.createFolderNode(defaultUser, 'folderName');
        const subFolderNode = driver.createFolderNode(defaultUser, 'folderName2');
        const subSubFolderNode = driver.createFolderNode(defaultUser, 'folderName3');

        subFolderNode.parent = parentFolderNode;
        subSubFolderNode.parent = subFolderNode;

        await driver.fileTreeRepo.save(parentFolderNode);
        await driver.fileTreeRepo.save(subFolderNode);
        await driver.fileTreeRepo.save(subSubFolderNode);

        await driver.notebookRepo.save(notebook);
        notebookNode.parent = subSubFolderNode;
        await driver.fileTreeRepo.save(notebookNode);

        const folder = await driver.folderService.getFolder(subFolderNode.id);
        const expected = {
          id: subFolderNode.id,
          name: 'folderName2',
          path: [
            {
              name: 'folderName',
              id: parentFolderNode.id,
            },
          ],
          dateCreated: expect.any(Number),
          dateUpdated: expect.any(Number),
          ownerDetails: { id: defaultUser },
          owner: defaultUser,
          type: FileType.folder,
          files: [
            {
              id: subSubFolderNode.id,
              dateCreated: expect.any(Number),
              dateUpdated: expect.any(Number),
              type: FileType.folder,
              name: 'folderName3',
              ownerDetails: { id: defaultUser },
              owner: defaultUser,
              path: [
                {
                  name: 'folderName',
                  id: parentFolderNode.id,
                },
                {
                  id: subFolderNode.id,
                  name: 'folderName2',
                },
              ],
            },
          ],
        };

        expect(folder).toMatchObject(expected);
      });
    });
  });

  describe('notebook service :: ', () => {
    it('get a notebook, with valid path', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = driver.createNotebookNode(
        defaultUser,
        notebookName,
      );
      const folderNode = driver.createFolderNode(defaultUser, 'folderName');
      const folderNode2 = driver.createFolderNode(defaultUser, 'folderName2');
      folderNode2.parent = folderNode;
      await driver.fileTreeRepo.save(folderNode);
      await driver.fileTreeRepo.save(folderNode2);
      notebookNode.parent = folderNode2;

      await driver.notebookRepo.save(notebook);
      await driver.fileTreeRepo.save(notebookNode);

      const response = await driver.notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.path).toEqual([
        { name: 'folderName', id: folderNode.id },
        { name: 'folderName2', id: folderNode2.id },
      ]);
    });

    it('get a notebook, with notes sorted in order', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = driver.createNotebookNode(
        defaultUser,
        notebookName,
      );

      await driver.notebookRepo.save(notebook);
      await driver.fileTreeRepo.save(notebookNode);

      const notes = range(5).map(i =>
        driver.createNote(defaultUser, `note${i}`, notebook.id),
      );
      for (const note of notes) {
        await driver.noteRepo.insertNewWithRank(note);
      }
      const from = 3;
      const to = 1;
      await driver.noteRepo.reorder(notes[from], to);

      const response = await driver.notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );
      expect(response!.notes[to].name).toBe(`note${from}`);
    });

    it('get a notebook, with favorite indication', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = driver.createNotebookNode(
        defaultUser,
        notebookName,
      );
      const favorite = driver.createFavorite(
        defaultUser,
        notebook.id,
        EntityType.Notebook,
      );

      await driver.notebookRepo.save(notebook);
      await driver.fileTreeRepo.save(notebookNode);
      await driver.favoritesRepo.save(favorite);

      const response = await driver.notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.isLiked).toBe(true);
    });

    it('get a notebook, with user details', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = driver.createNotebookNode(
        defaultUser,
        notebookName,
      );

      await driver.userRepo.save({
        id: defaultUser,
        name: 'some name',
        avatar: 'http://url',
        rootFolder: 'someId',
      });
      await driver.notebookRepo.save(notebook);
      await driver.fileTreeRepo.save(notebookNode);

      const response = await driver.notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.ownerDetails).toMatchObject({
        id: defaultUser,
        name: 'some name',
        avatar: 'http://url',
      });
    });

    it('get a notebook, even when user does not exist', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = driver.createNotebookNode(
        defaultUser,
        notebookName,
      );

      await driver.notebookRepo.save(notebook);
      await driver.fileTreeRepo.save(notebookNode);

      const response = await driver.notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.ownerDetails).toMatchObject({
        id: defaultUser,
        name: '',
      });
    });
  });

  describe('favorites service :: ', () => {
    it('get favorites per user', async () => {
      const secondUser = 'secondUser@foo.com';
      await driver.userRepo.save({
        id: defaultUser,
        name: 'some name',
        avatar: 'http://url',
        rootFolder: 'someId',
      });
      await driver.userRepo.save({
        id: secondUser,
        name: '2ndUser',
        avatar: 'http://url',
        rootFolder: 'someId2',
      });

      const notebook = driver.createNotebook(defaultUser);
      const favorite = driver.createFavorite(
        secondUser,
        notebook.id,
        EntityType.Notebook,
      );

      await driver.notebookRepo.save(notebook);
      await driver.favoritesRepo.save(favorite);

      const response = await driver.favoritesService.getFavoritesForUser(secondUser);

      expect(response).toEqual([
        {
          id: notebook.id,
          name: notebook.name,
          type: FileType.notebook,
          owner: notebook.owner,
          ownerDetails: expect.objectContaining({
            id: defaultUser,
            name: 'some name',
          }),
          isLiked: true,
          path: [],
          dateCreated: notebook.dateCreated,
          dateUpdated: notebook.dateUpdated,
        },
      ]);
    });
  });

  describe('trash bin :: ', () => {

  })
});
