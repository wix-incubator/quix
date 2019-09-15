import {StoreCache} from '../../lib/store';
import {INotebook} from '@wix/quix-shared';
import {setNotebook, setError} from './notebook-actions';
import {notebook} from '../../services/resources';
import {createExamplesNotebook} from '../../data';
import {ExamplesNotebook} from '../../config';

export default store => new StoreCache<INotebook>(store, 'notebook.notebook')
  .cacheWith(setNotebook)
  .catchWith(setError)
  .fetchWith(id => {
    return id === ExamplesNotebook.id ? Promise.resolve(createExamplesNotebook()) : notebook(id)
  });
