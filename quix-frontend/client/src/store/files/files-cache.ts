import {StoreCache} from '../../lib/store';
import {setFiles, setError} from './files-actions';
import {files} from '../../services/resources';
import {IFile} from '@wix/quix-shared';

export default store => new StoreCache<IFile[]>(store, 'files.files')
  .cacheWith(setFiles)
  .catchWith(setError)
  .fetchWith(files);
