import {StoreCache} from '../../lib/store';
import {setFiles} from './files-actions';
import {files} from '../../services/resources';

export default store => new StoreCache<any[]>(store, 'files.files')
  .cacheWith(setFiles)
  .fetchWith(files);
