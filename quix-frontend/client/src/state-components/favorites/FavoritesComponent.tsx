import React, {useEffect} from 'react';
import {IFile} from '@wix/quix-shared';
import {useViewState} from '../../services/hooks';
import {SortableTable} from '../../lib/ui/components/sortable-table/SortableTable';
import {favoritesTableFields} from './favorites-table-fields';
import {EmptyState, ErrorState, InitialState} from '../../lib/ui/components/sortable-table/states';
import {cloneDeep} from 'lodash';

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
    if (!error) {
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

  const renderContentState = () => {
    return (
      <div className="bi-section-content bi-c-h">
        <div
          className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
          data-hook="favorites-content"
        >
          <div className="bi-panel-content bi-c-h">
            <SortableTable
              columns={favoritesTableFields(onLikeToggle).map(field => ({
                header: field.title || field.name,
                renderRow: row => field.filter(undefined, row),
                accessor: field.name,
                className: field.className,
              }))}
              data={stateData.favorites}
              onRowClicked={row => onFavoriteClick(row)}
            />
          </div>
        </div>
      </div>
    );
  };

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
                return <InitialState entityName={'favorites'} />;
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
