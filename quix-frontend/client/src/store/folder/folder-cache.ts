import {StoreCache} from '../../lib/store';
import {IFolder, createFolderPayload} from '@wix/quix-shared';
import {setFolder, setError} from './folder-actions';
import * as Resources from '../../services/resources';
import {createQuixFolder} from '../../data';
import {QuixFolder} from '../../config';

export default store => new StoreCache<IFolder>(store, 'folder.folder')
  .cacheWith(setFolder)
  .catchWith(setError)
  .fetchWith(id =>  {
    if (id) {
      if (id === QuixFolder.id) {
        return Promise.resolve(createQuixFolder());
      }

      return Resources.folder(id);
    }
    
    return Resources.files().then(files => {
      const root = files.find(file => !file.path.length);
      const children = files.filter(file => file.path.length === 1);

      return createFolderPayload([], {
        ...root,
        files: children
      });
    });
  });
