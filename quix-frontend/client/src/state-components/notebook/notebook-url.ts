import {find} from 'lodash';
import {INotebook} from '../../../../shared';
import {setNote} from '../../store/notebook/notebook-actions';

export const note = (id: string, notebook: INotebook) => setNote(id && find(notebook.notes, {id}));