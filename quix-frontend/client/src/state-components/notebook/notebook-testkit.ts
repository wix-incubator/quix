import {Testkit} from '../../../test/e2e/driver';
import {NoteTestkit} from '../../components/note/note-testkit';
import {BreadcrumbsTestkit} from '../../components/breadcrumbs/breadcrumbs-testkit';
import {ActionsTestkit} from '../../components/actions/actions-testkit';

const enum Hooks {
  Empty = 'notebook-empty',
  Error = 'notebook-error',
  Content = 'notebook-content',
  Note = 'notebook-note',
  AddNote = 'notebook-add-note',
  AddNoteDropdown = 'notebook-add-note-dropdown',
}

export class NotebookTestkit extends Testkit {
  async getBreadcrumbsTestkit() {
    return new BreadcrumbsTestkit(await this.query.$('quix-breadcrumbs'));
  }

  async getActionsTestkit() {
    return new ActionsTestkit(await this.query.$('quix-actions'));
  }

  async getNoteTestkit(index: number) {
    return new NoteTestkit(await this.query.hook(Hooks.Note, `:nth-child(${index})`));
  }

  async hasEmptyState() {
    return (await this.query.hook(Hooks.Empty)) !== null;
  }

  async hasErrorState() {
    return (await this.query.hook(Hooks.Error)) !== null;
  }


  async hasNotes() {
    return (await this.query.hook(Hooks.Content)) !== null;
  }

  async clickAddNote() {
    return this.click.hook(Hooks.AddNote, ':first-child');
  }

  async clickAddNoteDropdown() {
    await this.click.hook(Hooks.AddNoteDropdown);
  }

  async numOfNotes() {
    return (await this.query.hooks(Hooks.Note)).length;
  }

  async isAddNoteEnabled() {
    return this.evaluate.hook(Hooks.AddNoteDropdown, el => !el.hasAttribute('disabled'));
  }
}