import {values} from 'lodash';
import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IFile, NotebookActionTypes, FileActionTypes, fileReducer, filesReducer, composeReducers} from '../../../../shared';

export interface IView {
  markedMap: Record<string, IFile>;
  markedList: IFile[];
}

export interface IPermissions {
  edit: boolean;
}

export default (app: Instance): IBranch => register => {
  const files = composeReducers(
    filesReducer,
    (state: IFile[] = null, action: any) => {
      switch (action.type) {
        case 'files.set':
          return action.files;
        default:
      }
  
      return state;
    },
  );

  const file = composeReducers(
    fileReducer,
    (state: IFile = null, action: any) => {
      switch (action.type) {
        case 'file.set':
          return action.file;
        default:
      }
  
      return state;
    },
  );

  const view = (state: IView = {
    markedMap: {},
    markedList: []
  }, action: any): IView => {
    switch (action.type) {
      case FileActionTypes.createFile:
      case 'file.set':
      case 'files.view.unmarkAll':
        return {
          markedMap: {},
          markedList: []
        };
      case FileActionTypes.deleteFile:
      case NotebookActionTypes.deleteNotebook:
        // tslint:disable-next-line: no-dynamic-delete
        delete state.markedMap[action.id];
        return {...state, markedList: values<IFile>(state.markedMap).filter(n => !!n)};  
      case 'files.view.toggleMark':
        state.markedMap[action.file.id] = state.markedMap[action.file.id] ? undefined : action.file;
        return {...state, markedList: values<IFile>(state.markedMap).filter(f => !!f)};
      default:
    }

    return state;
  }

  const permissions = (state: IPermissions = {
    edit: false
  }, action: any) => {
    switch (action.type) {
      case FileActionTypes.createFile:
      case 'file.set':
        return action.file.id ? {
          edit: app.getUser().getEmail() === action.file.owner
        } : {
          edit: true
        };
      default:
    }

    return state;
  }

  register(combineReducers({files, file, view, permissions}));
};
