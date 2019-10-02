import {values, reject} from 'lodash';
import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';
import {
  IFile,
  IFolder,
  NotebookActionTypes,
  FileActionTypes,
  clientFileReducer,
  clientFileListReducer,
  composeReducers
} from '@wix/quix-shared';

import {getFolderPermissions, getDefaultPermissions, IPermissions} from '../../services';

export interface IView {
  markedMap: Record<string, IFile>;
  markedList: IFile[];
}

export default (app: App): IBranch => register => {
  const folder = composeReducers(
    clientFileReducer,
    (state: IFolder = null, action: any) => {
      switch (action.type) {
        case 'folder.set':
          return action.folder;
        default:
      }
  
      return state;
    },
  );

  const files = composeReducers(
    clientFileListReducer,
    (state: IFile[] = null, action: any) => {
      switch (action.type) {
        case 'folder.set':
          return action.folder && action.folder.files;
        case FileActionTypes.moveFile:
        case NotebookActionTypes.moveNotebook:
          return state && reject(state, {id: action.id});
        default:
      }
  
      return state;
    },
  );

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'folder.set':
        return null;
      case 'folder.setError':
        return action.error;
      default:
    }

    return state;
  }

  const view = (state: IView = {
    markedMap: {},
    markedList: []
  }, action: any): IView => {
    switch (action.type) {
      case 'folder.set':
      case 'folder.view.unmarkAll':
        return {
          markedMap: {},
          markedList: []
        };
      case FileActionTypes.deleteFile:
      case NotebookActionTypes.deleteNotebook:
        // tslint:disable-next-line: no-dynamic-delete
        delete state.markedMap[action.id];
        return {...state, markedList: values<IFile>(state.markedMap).filter(n => !!n)};  
      case 'folder.view.toggleMark':
        state.markedMap[action.file.id] = state.markedMap[action.file.id] ? undefined : action.file;
        return {...state, markedList: values<IFile>(state.markedMap).filter(f => !!f)};
      default:
    }

    return state;
  }

  const permissions = (state: IPermissions = getDefaultPermissions(), action: any): IPermissions => {
    switch (action.type) {
      case 'folder.set':
        return action.folder ? getFolderPermissions(app, action.folder) : getDefaultPermissions();
      default:
    }

    return state;
  }

  register(combineReducers({folder, files, error, view, permissions}));
};
