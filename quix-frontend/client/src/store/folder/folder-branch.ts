import {values} from 'lodash';
import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {
  IFile,
  IFolder,
  NotebookActionTypes,
  FileActionTypes,
  clientFileReducer,
  clientFileListReducer,
  composeReducers,
} from '../../../../shared';

export interface IView {
  error: any;
  fileError: any;
  markedMap: Record<string, IFile>;
  markedList: IFile[];
}

export interface IPermissions {
  edit: boolean;
}

export default (app: Instance): IBranch => register => {
  const files = composeReducers(
    clientFileListReducer,
    (state: IFolder = null, action: any) => {
      switch (action.type) {
        case 'files.set':
          return action.files;
        default:
      }
  
      return state;
    },
  );

  const file = composeReducers(
    clientFileReducer,
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
    error: null,
    fileError: null,
    markedMap: {},
    markedList: []
  }, action: any): IView => {
    switch (action.type) {
      case 'file.set':
      case 'files.view.unmarkAll':
        return {
          error: null,
          fileError: null,
          markedMap: {},
          markedList: []
        };
      case 'files.view.setError':
        return {
          ...state,
          error: action.error
        };
      case 'files.view.setFileError':
        return {
          ...state,
          fileError: action.error
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
      case 'file.set':
        return action.file && action.file.id ? {
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
