import { INote } from './types';
import {
  createReducer,
  createClientReducer,
  composeReducers,
  createListReducer,
  createClientListReducer,
} from '../common/create-reducer';
import { NoteActions, NoteActionTypes } from './actions';
import { AnyAction } from '../common/common-types';

const commonReducer = (state: INote | undefined, action: NoteActions) => {
  switch (action.type) {
    case NoteActionTypes.move:
      return state && { ...state, notebookId: action.newNotebookId };
    case NoteActionTypes.updateContent:
      // update of "plain text" content happens in the default reducer
      if (state) {
        state.dateUpdated = (action as AnyAction).dateCreated || Date.now();
        return { ...state, richContent: action.richContent };
      }
      return state;
    default:
      return state;
  }
};

export const noteReducer = composeReducers(
  commonReducer,
  createReducer('note')
);

export const clientNoteReducer = composeReducers(
  commonReducer,
  createClientReducer('note')
);

export const noteListReducer = composeReducers(
  createListReducer('note', createReducer('note')) as any
);

export const clientNoteListReducer = composeReducers(
  createClientListReducer('note', createReducer('note')) as any
);
