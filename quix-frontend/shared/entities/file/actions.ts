import {IFile, IFilePathItem} from './types';
import {ExtractActionTypes, ExtractActions} from '../common/actions';

export const FileActions = {
  createFile: (id: string, file: IFile) => ({
    type: 'file.create' as const,
    id,
    file
  }),

  deleteFile: (id: string) => ({
    type: 'file.delete' as const,
    id
  }),

  moveFile: (id: string, newPath: IFilePathItem[]) => ({
    type: 'file.update.path' as const,
    id,
    path: newPath
  }),

  updateName: (id: string, name: string) => ({
    type: 'file.update.name' as const,
    id,
    name
  }),

  toggleIsLiked: (id: string, isLiked: boolean) => ({
    type: 'file.update.isLiked' as const,
    id,
    isLiked
  }),
}

export type FileActions = ExtractActions<typeof FileActions>
export type FileActionTypes = ExtractActionTypes<typeof FileActions>
export const FileActionTypes = ExtractActionTypes(FileActions);
