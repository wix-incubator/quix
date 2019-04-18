import {expect} from 'chai';
import {Driver} from './driver';
import {createMockNotebook, createMockNote} from '../mocks';
import {NotebookTestkit} from '../../src/state-components/notebook/notebook-testkit';

describe('Notebook ::', () => {
  let driver: Driver, testkit: NotebookTestkit;

  beforeEach(async () => {
    driver = new Driver();
    await driver.init();

    testkit = new NotebookTestkit(driver.getTestkitPage());
  });

  it('should display error state when notebook is not found', async () => {
    await driver.mock.http('/api/notebook/:id', [404, {message: 'Notebook not found'}]);
    await driver.goto(`/notebook/1`);

    expect(await testkit.hasErrorState()).to.be.true;
  });

  it('should display empty state when notebook is empty', async () => {
    const notebook = createMockNotebook();

    await driver.mock.http('/api/notebook/:id', notebook);
    await driver.goto(`/notebook/${notebook.id}`);

    expect(await testkit.hasEmptyState()).to.be.true;
  });

  it('should display notes if notebook has at least one note', async () => {
    const notebook = createMockNotebook([createMockNote()]);

    await driver.mock.http('/api/notebook/:id', notebook);
    await driver.goto(`/notebook/${notebook.id}`);
    
    expect(await testkit.hasNotes()).to.be.true;
  });

  it('should navigate to the files state', async () => {
    const notebook = createMockNotebook();

    await driver.mock.http('/api/notebook/:id', notebook);
    await driver.goto(`/notebook/${notebook.id}`);

    const breadcrumbsTestkit = await testkit.getBreadcrumbsTestkit();
    await breadcrumbsTestkit.clickFile(1);

    expect(await driver.url.matches('/files/')).to.be.true;
  });

  it('should not focus the name input of existing note', async () => {
    const notebook = createMockNotebook([createMockNote()]);

    await driver.mock.http('/api/notebook/:id', notebook);
    await driver.goto(`/notebook/${notebook.id}`);

    expect(await testkit.numOfNotes()).to.equal(1);

    const noteTestkit = await testkit.getNoteTestkit(1);
    expect(await noteTestkit.isNameFocused()).to.be.false;
  });

  it('should add a note and focus the name input', async () => {
    const notebook = createMockNotebook([createMockNote()]);

    await driver.mock.http('/api/notebook/:id', notebook);
    await driver.goto(`/notebook/${notebook.id}`);

    expect(await testkit.numOfNotes()).to.equal(1);
    await testkit.clickAddNote();
    expect(await testkit.numOfNotes()).to.equal(2);

    const noteTestkit = await testkit.getNoteTestkit(2);
    expect(await noteTestkit.isNameFocused()).to.be.true;
  });
});
