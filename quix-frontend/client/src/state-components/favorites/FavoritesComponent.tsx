import React, {useState, useEffect} from 'react';
import {IFile} from '@wix/quix-shared';
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

export function Favorites(props: FavoritesProps) {
  const {favorites, error, onFavoriteClick, onLikeToggle: onLikeToggleServer} = props;
  const isEmptyState = favorites && favorites.length === 0;
  const [rows, setRows] = useState<IFile[]>(favorites);

  useEffect(() => {
    setRows(favorites);
  }, [favorites]);

  const displayNoContentState = () => {
    return (
      <div className="bi-section-content--center">
        {
          error
            ? <ErrorState errorMessage={error.message}/>
            : isEmptyState
            ? <EmptyState />
            : <InitialState entityName={'favorites'}/>
        }
      </div>
    );
  };

  const onLikeToggle = (file: IFile) => {
    const tempRows = cloneDeep(rows);
    const currentFile = tempRows.find(row => row.id === file.id);
    currentFile.isLiked = !currentFile.isLiked;
    onLikeToggleServer(file);
    setRows(tempRows);
  }

  const displayLoadedState = () => {
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
              data={favorites}
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
        <div>
          <div className="bi-section-title">
            Favorites
            {favorites && !isEmptyState && (
              <span className="bi-fade-in">{` (${favorites.length})`}</span>
            )}
          </div>
        </div>
      </div>
      {!favorites || isEmptyState
        ? displayNoContentState()
        : displayLoadedState()}
    </div>
  );
}
