import {INote} from './types';
import {createReducer, createClientReducer, composeReducers, createListReducer, createClientListReducer} from '../common/create-reducer';
import {NoteActions, NoteActionTypes} from './actions';

const commonReducer = (state: INote | undefined, action: NoteActions) => {
  switch (action.type) {
    case NoteActionTypes.move:
      return state && {...state, notebookId: action.newNotebookId};
    default:
      return state;
  }
}

export const noteReducer = composeReducers(
  createReducer('note'),
  commonReducer
);

export const clientNoteReducer = composeReducers(
  createClientReducer('note'),
  commonReducer
);

export const noteListReducer = composeReducers(
  createListReducer('note', createReducer('note')) as any
);

export const clientNoteListReducer = composeReducers(
  createClientListReducer('note', createReducer('note')) as any
);

