import {INote} from './types';
import {createReducer, composeReducers, createListReducer} from '../common/create-reducer';
import {NoteActions, NoteActionTypes} from './actions';

export const noteReducer = composeReducers(
  createReducer('note'),
  (state: INote | undefined, action: NoteActions) => {
    switch (action.type) {
      case NoteActionTypes.move:
        return state && {...state, notebookId: action.newNotebookId};
      default:
        return state;
    }
  }
);

export const noteListReducer = composeReducers(
  createListReducer('note', createReducer('note')) as any
);
