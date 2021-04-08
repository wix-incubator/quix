import {INotebook, INote} from '@wix/quix-shared';

export const setNotebook = (notebook: INotebook) => ({
  type: 'notebook.set',
  notebook
});

export const setError = (error: any) => ({
  type: 'notebook.setError',
  error
});

export const queueNote = (note: INote) => ({
  type: 'notebook.queue.note',
  note
});

export const setNote = (note: INote) => ({
  type: 'notebook.view.setNote',
  note
});

export const toggleMark = (note: INote) => ({
  type: 'notebook.view.toggleMark',
  note
});

export const unmarkAll = () => ({
  type: 'notebook.view.unmarkAll'
});
