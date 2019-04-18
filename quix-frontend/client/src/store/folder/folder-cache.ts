import {find} from 'lodash';
import {StoreCache} from '../../lib/store';
import {IFolder, createFolderPayload} from '../../../../shared';
import {setFolder, setError} from './folder-actions';
import * as Resources from '../../services/resources';

export default store => new StoreCache<IFolder>(store, 'folder.folder')
  .cacheWith(setFolder)
  .catchWith(setError)
  .fetchWith(id => id ? Resources.folder(id) : Resources.files().then(files => {
    const root = find(files, {path: []});
    const children = files.filter(file => file.path.length === 1);

    return createFolderPayload([], {
      ...root,
      files: children
    });
  }));
