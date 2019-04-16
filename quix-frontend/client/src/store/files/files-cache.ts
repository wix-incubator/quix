import {StoreCache} from '../../lib/store';
import {setFiles, setError} from './files-actions';
import {files} from '../../services/resources';

export default store => new StoreCache<any[]>(store, 'files.files')
  .cacheWith(setFiles)
  .catchWith(setError)
  .fetchWith(files);
