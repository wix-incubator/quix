import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './favorites-types';
import {IFile, FileActions} from '../../../../shared';
import {goToFile} from '../../services';
import { toast } from '../../lib/ui';

export const onFavoriteClick = (scope: IScope, store: Store, app: Instance) => (favorite: IFile) => {
  goToFile(app, favorite);
};

export const onLikeToggle = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  const {id, isLiked} = file;

  store.dispatchAndLog(FileActions.toggleIsLiked(id, !isLiked))
    .then((action) => toast.showToast({
      text: action.isLiked ? 'Added notebook to favorites' : 'Removed notebook from favorites',
      type: 'success'
    }, 3000));
}
