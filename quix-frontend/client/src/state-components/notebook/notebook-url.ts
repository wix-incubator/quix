import {find} from 'lodash';
import {INote} from '@wix/quix-shared';
import {setNote, noop} from '../../store/notebook/notebook-actions';

export const note = (id: string, notes: INote[]) => setNote(id && find(notes, {id}));
export const noteId = (id: string, notes: INote[]) => id ? setNote(find(notes, {id})) : noop();