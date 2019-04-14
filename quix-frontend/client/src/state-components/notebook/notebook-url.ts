import {find} from 'lodash';
import {INote} from '../../../../shared/dist';
import {setNote} from '../../store/notebook/notebook-actions';

export const noteId = (id: string, notes: INote[]) => setNote(id && find(notes, {id}));