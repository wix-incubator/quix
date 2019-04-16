import {TestkitPage} from '../../../test/e2e/driver';
import {NoteTestkit} from '../../components/note/note-testkit';
import {BreadcrumbsTestkit} from '../../components/breadcrumbs/breadcrumbs-testkit';

export class NotebookTestkit {
  constructor (private readonly page: TestkitPage) {}

  async getBreadcrumbsTestkit() {
    return new BreadcrumbsTestkit(await this.page.query.$('quix-breadcrumbs'));
  }

  async getNoteTestkit(index: number) {
    return new NoteTestkit(await this.page.query.hook('notebook-note', `:nth-child(${index})`));
  }

  async hasEmptyState() {
    return (await this.page.query.hook('notebook-empty')) !== null;
  }

  async hasErrorState() {
    return (await this.page.query.hook('notebook-error')) !== null;
  }


  async hasNotes() {
    return (await this.page.query.hook('notebook-content')) !== null;
  }

  async clickAddNote() {
    return this.page.click.hook('notebook-add-note');
  }

  async numOfNotes() {
    return (await this.page.query.hooks('notebook-note')).length;
  }
}