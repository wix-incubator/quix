import React, {useEffect} from 'react';
import {IFile} from '@wix/quix-shared';
import {cloneDeep} from 'lodash';
import {favoritesTableFields} from './favorites-table-fields';
import {useViewState} from '../../services/hooks';
import {Table} from '../../lib/ui/components/table/Table';
import {EmptyState, ErrorState, InitialState} from '../../lib/ui/components/states';

export interface FavoritesProps {
  favorites: IFile[];
  error: {message: string};
  onFavoriteClick(favorite: IFile): void;
  onLikeToggle(favorite: IFile): void;
  emptyStateImgSrc: string;
}

const States = [
  'Initial',
  'Error',
  'Empty',
  'Content',
];

export function Favorites(props: FavoritesProps) {
  const {favorites: serverFavorites, error, onFavoriteClick, onLikeToggle: onLikeToggleServer} = props;

  const [stateData, viewState] = useViewState(States, {
    favorites: [],
    emailFilter: '',
    errorMessage: '',
  });

  useEffect(() => {
    if (!error && serverFavorites?.length >= 0) {
      viewState.set(serverFavorites?.length ? 'Content' : 'Empty', {favorites: serverFavorites || []});
    }
  },[serverFavorites]);

  useEffect(() => {
    if (error) {
      viewState.set('Error', {errorMessage: error.message});
    }
  }, [error]);

  const onLikeToggle = (file: IFile) => {
    const tempFavorites = cloneDeep(stateData.favorites);
    const currentFile = tempFavorites.find(favorite => favorite.id === file.id);
    currentFile.isLiked = !currentFile.isLiked;
    onLikeToggleServer(file);
    viewState.set('Content', {favorites: tempFavorites});
  }

  const renderContentState = () => (
    <Table
      hookName="favorites"
      columns={favoritesTableFields(onLikeToggle).map(field => ({
        header: field.title || field.name,
        render: row => field.filter(undefined, row),
        accessor: field.name,
        className: field.className,
      }))}
      data={stateData.favorites}
      onRowClicked={row => onFavoriteClick(row)}
    />
  );

  return (
    <div className="bi-section bi-c-h bi-grow">
      <div className="bi-section-header">
        <div className="bi-section-title">
          <span>Favorites {viewState.min('Empty') && <span className='bi-fade-in'>({stateData.favorites.length})</span>}</span>
        </div>
      </div>

      <div className="bi-section-content bi-c-h bi-s-v--x15">
        {
          (() => {
            switch(viewState.get()) {
              case 'Initial':
                return <InitialState entityName="favorites" />;
              case 'Error':
                return <ErrorState errorMessage={error.message} />;
              case 'Empty':
                return <EmptyState />;
              case 'Content':
                return renderContentState();
              default:
            }
          })()
        }
      </div>
    </div>
  );
}
