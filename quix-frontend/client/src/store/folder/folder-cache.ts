import {StoreCache} from '../../lib/store';
import {setFiles, setError} from './folder-actions';
import {files} from '../../services/resources';
import {IFolder} from '../../../../shared';

export default store => new StoreCache<IFolder>(store, 'folder.folder')
  .cacheWith(setFiles)
  .catchWith(setError)
  .fetchWith(files);
