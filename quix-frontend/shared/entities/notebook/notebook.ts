import uuid from 'uuid/v4';
import {INotebook} from './types';
import {createNote} from '../note/note';
import {IFilePathItem} from '../file/types';
import {createEmptyIUser} from '../user/user';
import {IUser} from '../user';


export const createNotebook = (path: IFilePathItem[] = [], props: Partial<INotebook> = {}, user: IUser = createEmptyIUser('')): INotebook => ({
  id: uuid(),
  name: 'New notebook',
  notes: [],
  isLiked: false,
  path,
  owner: user.id,
  ownerDetails: user,
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props
});

export const createNotebookWithNote = (path: IFilePathItem[] = [], props: Partial<INotebook> = {}) => ((notebook: INotebook): INotebook => ({
  ...notebook,
  notes: [createNote(notebook.id)],
}))(createNotebook(path, props));
