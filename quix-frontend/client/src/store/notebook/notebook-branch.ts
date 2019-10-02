import {values} from 'lodash';
import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';
import {
  INotebook,
  INote,
  composeReducers,
  clientNotebookReducer,
  noteListReducer,
  NoteActionTypes
} from '@wix/quix-shared';

import {getNotebookPermissions, getDefaultPermissions, IPermissions} from '../../services';

export interface IQueue {
  notes: Record<string, INote>;
  size: number;
}

export interface IView {
  markedMap: Record<string, INote>;
  markedList: INote[];
  note: INote;
}

export default (app: App): IBranch => register => {
  const notebook = composeReducers(
    clientNotebookReducer,
    (state: INotebook = null, action: any) => {
      switch (action.type) {
        case 'notebook.set':
          return action.notebook;
        default:
      }
  
      return state;
    },
  );

  const notes = composeReducers(
    noteListReducer,
    (state: INote[] = [], action: any) => {
      switch (action.type) {
        case 'notebook.set':
          return action.notebook ? action.notebook.notes : [];
        default:
      }
  
      return state;
    },
  );

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'notebook.set':
        return null;
      case 'notebook.setError':
        return action.error;
      default:
    }

    return state;
  }

  const queue = (state: IQueue = {notes: {}, size: 0}, action: any): IQueue => {
    switch (action.type) {
      case 'notebook.queue.note':
        state.notes = {...state.notes, [action.note.id]: action.note};
        return {...state, size: Object.keys(state.notes).length};
      case NoteActionTypes.updateContent:
      case NoteActionTypes.deleteNote:
        // tslint:disable-next-line: no-dynamic-delete
        delete state.notes[action.id];
        return {...state, size: Object.keys(state.notes).length};
      default:
    }

    return state;
  }

  const view = (state: IView = {
    markedMap: {},
    markedList: [],
    note: null
  }, action: any): IView => {
    switch (action.type) {
      case 'notebook.set':
        return {
          markedMap: {},
          markedList: [],
          note: null
        };
      case 'notebook.view.unmarkAll':
        return {
          ...state, 
          markedMap: {},
          markedList: []
        };
      case NoteActionTypes.deleteNote:
        // tslint:disable-next-line: no-dynamic-delete
        delete state.markedMap[action.id];
        return {...state, markedList: values<INote>(state.markedMap).filter(n => !!n)};
      case 'notebook.view.toggleMark':
        state.markedMap[action.note.id] = state.markedMap[action.note.id] ? undefined : action.note;
        return {...state, markedList: values<INote>(state.markedMap).filter(n => !!n)};
      case 'notebook.view.setNote':
        return {...state, note: action.note};
      default:
    }

    return state;
  }

  const permissions = (state: IPermissions = {
    edit: false
  }, action: any): IPermissions => {
    switch (action.type) {
      case 'notebook.set':
        return action.notebook ? getNotebookPermissions(app, action.notebook) : getDefaultPermissions();
      default:
    }

    return state;
  }

  register(combineReducers({notebook, notes, error, queue, view, permissions}));
};
