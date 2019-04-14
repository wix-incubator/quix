import {StoreCache} from '../../lib/store';
import {INotebook} from '../../../../shared';
import {setNotebook} from './notebook-actions';
import {notebook} from '../../services/resources';

export default store => new StoreCache<INotebook>(store, 'notebook.notebook')
  .cacheWith(setNotebook)
  .fetchWith(notebook);
