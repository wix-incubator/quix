import {expect} from 'chai';
import {Driver} from './driver';
import {createMockNotebook, createMockNote} from '../mocks';
import {NotebookTestkit} from '../../src/state-components/notebook/notebook-testkit';

describe('Notebook ::', () => {
  let driver: Driver, testkit: NotebookTestkit;

  const gotoEditableNotebook = async (notes = [createMockNote('1')]) => {
    const notebook = createMockNotebook(notes);

    await driver.mock.http(`/api/notebook/:id`, notebook);
    await driver.goto('/notebook/1');
  }

  const gotoReadonlyNotebook = async () => {
    const notebook = createMockNotebook([createMockNote('1')], {owner: 'readonly@quix.com'});

    await driver.mock.http(`/api/notebook/:id`, notebook);
    await driver.goto('/notebook/1');
  }

  const gotoErrorNotebook = async () => {
    await driver.mock.http('/api/notebook/:id', [404, {message: 'Notebook not found'}]);
    await driver.goto(`/notebook/1`);
  }

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = driver.createTestkit(NotebookTestkit);
  });

  it('should display error state when notebook is not found', async () => {
    await gotoErrorNotebook();

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display empty state when notebook is empty', async () => {
    await gotoEditableNotebook([]);

    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display notes if notebook has at least one note', async () => {
    await gotoEditableNotebook();

    expect(await testkit.hasNotes()).to.be.true;
  });

  it('should navigate to the files state', async () => {
    await gotoEditableNotebook();

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();
    await breadcrumbsTestkit.clickFile(1);

    expect(await driver.url.matches('/files/')).to.be.true;
  });

  it('should not focus the name input of existing note', async () => {
    await gotoEditableNotebook();

    expect(await testkit.numOfNotes()).to.equal(1);

    const noteTestkit = await testkit.getNoteTestkit(1);
    expect(await noteTestkit.isNameFocused()).to.be.false;
  });

  it('should add a note and focus the name input', async () => {
    await gotoEditableNotebook();

    expect(await testkit.numOfNotes()).to.equal(1);
    await testkit.clickAddNoteDropdown();
    await driver.sleep(500);
    await testkit.clickAddNote();

    expect(await testkit.numOfNotes()).to.equal(2);

    const noteTestkit = await testkit.getNoteTestkit(2);
    expect(await noteTestkit.isNameFocused()).to.be.true;
  });

  describe('Permissions ::', () => {
    describe('Name ::', () => {
      it('should allow to edit name if user is owner', async () => {
        await gotoEditableNotebook();

        const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

        expect(await breadcrumbsTestkit.isFileNameEditable()).to.be.true;
      });

      it('should not allow to edit name if user is not owner', async () => {
        await gotoReadonlyNotebook();

        const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();

        expect(await breadcrumbsTestkit.isFileNameEditable()).to.be.false;
      });
    });

    describe('Add note ::', () => {
      it('should enable "Add note" button if user is owner', async () => {
        await gotoEditableNotebook();

        expect(await testkit.isAddNoteEnabled()).to.be.true;
      });

      it('should disable "Add note" button if user is not owner', async () => {
        await gotoReadonlyNotebook();

        expect(await testkit.isAddNoteEnabled()).to.be.false;
      });
    });

    describe('Delete ::', () => {
      it('should enable the delete action if user is owner', async () => {
        await gotoEditableNotebook();

        const actionsTestkit = await testkit.getActionsTestkit();

        expect(await actionsTestkit.isDeleteEnabled()).to.be.true;
      });

      it('should disable the delete action if user is not owner', async () => {
        await gotoReadonlyNotebook();

        const actionsTestkit = await testkit.getActionsTestkit();

        expect(await actionsTestkit.isDeleteEnabled()).to.be.false;
      });
    });

    describe('Note ::', () => {
      describe('Name ::', () => {
        it('should allow to edit note name if user is owner', async () => {
          await gotoEditableNotebook();

          const noteTestkit = await testkit.getNoteTestkit(1);

          expect(await noteTestkit.isNameEditable()).to.be.true;
        });

        it('should not allow to edit note name if user is not owner', async () => {
          await gotoReadonlyNotebook();

          const noteTestkit = await testkit.getNoteTestkit(1);

          expect(await noteTestkit.isNameEditable()).to.be.false;
        });
      });

      describe('Select ::', () => {
        it('should allow to select note if user is owner', async () => {
          await gotoEditableNotebook();

          const noteTestkit = await testkit.getNoteTestkit(1);

          expect(await noteTestkit.isSelectEnabled()).to.be.true;
        });

        it('should not allow to select note if user is not owner', async () => {
          await gotoReadonlyNotebook();

          const noteTestkit = await testkit.getNoteTestkit(1);

          expect(await noteTestkit.isSelectEnabled()).to.be.false;
        });
      });

      describe('Delete ::', () => {
        it('should allow to delete note if user is owner', async () => {
          await gotoEditableNotebook();

          const noteTestkit = await testkit.getNoteTestkit(1);
          const actionsTestkit = await noteTestkit.getActionsTestkit();

          expect(await actionsTestkit.isDeleteEnabled()).to.be.true;
        });

        it('should not allow to delete note if user is not owner', async () => {
          await gotoReadonlyNotebook();

          const noteTestkit = await testkit.getNoteTestkit(1);
          const actionsTestkit = await noteTestkit.getActionsTestkit();

          expect(await actionsTestkit.isDeleteEnabled()).to.be.false;
        });
      });
    });
  });
});
