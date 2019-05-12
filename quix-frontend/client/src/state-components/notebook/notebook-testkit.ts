import {Testkit} from '../../../test/e2e/driver';
import {NoteTestkit} from '../../components/note/note-testkit';
import {BreadcrumbsTestkit} from '../../components/breadcrumbs/breadcrumbs-testkit';

export class NotebookTestkit extends Testkit {
  async getBreadcrumbsTestkit() {
    return new BreadcrumbsTestkit(await this.query.$('quix-breadcrumbs'));
  }

  async getNoteTestkit(index: number) {
    return new NoteTestkit(await this.query.hook('notebook-note', `:nth-child(${index})`));
  }

  async hasEmptyState() {
    return (await this.query.hook('notebook-empty')) !== null;
  }

  async hasErrorState() {
    return (await this.query.hook('notebook-error')) !== null;
  }


  async hasNotes() {
    return (await this.query.hook('notebook-content')) !== null;
  }

  async clickAddNote() {
    return this.click.hook('notebook-add-note');
  }

  async numOfNotes() {
    return (await this.query.hooks('notebook-note')).length;
  }
}