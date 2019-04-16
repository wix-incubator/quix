import {find} from 'lodash';
import {INote} from '../../../../shared';
import {setNote} from '../../store/notebook/notebook-actions';

export const note = (id: string, notes: INote[]) => setNote(id && find(notes, {id}));