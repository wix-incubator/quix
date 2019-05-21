import {StoreCache} from '../../lib/store';
import {INotebook} from '../../../../shared';
import {setNotebook, setError} from './notebook-actions';
import {notebook} from '../../services/resources';
import {createExamplesNotebook} from '../../data';

export default store => new StoreCache<INotebook>(store, 'notebook.notebook')
  .cacheWith(setNotebook)
  .catchWith(setError)
  .fetchWith(id => {
    const examplesNotebook = createExamplesNotebook();

    return id === examplesNotebook.id ? Promise.resolve(examplesNotebook) : notebook(id)
  });
