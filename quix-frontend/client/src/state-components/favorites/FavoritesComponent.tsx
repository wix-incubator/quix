import * as React from 'react';
import {IFile} from '@wix/quix-shared';
import {Table} from '../../lib/ui/components/Table';
import {Image} from '../../lib/ui/components/Image';
import {favoritesTableFields} from './favorites-table-fields';

export interface FavoritesProps {
  favorites: IFile[];
  error: {message: string};
  onFavoriteClick(favorite: IFile): void;
  onLikeToggle(favorite: IFile): void;
  emptyStateImgSrc: string;
}

export function Favorites(props: FavoritesProps) {
  const {favorites, error, onFavoriteClick, onLikeToggle} = props;
  const isEmptyState = favorites && favorites.length === 0;

  const displayLoadingState = () => {
    return (
      <div className="bi-empty-state--loading bi-fade-in">
        <div className="bi-empty-state-content">Loading favorites...</div>
      </div>
    );
  };

  const displayErrorState = () => {
    return (
      <div
        className="bi-empty-state bi-fade-in"
        data-hook="favorites-error"
      >
        <div className="bi-empty-state-icon bi-danger">
          <i className="bi-icon bi-danger">error_outline</i>
        </div>
        <div className="bi-empty-state-header">{error.message}</div>
      </div>
    );
  };

  const displayEmptyState = () => {
    return (
      <div
        className="bi-empty-state bi-fade-in"
        data-hook="favorites-empty"
      >
        <Image className="bi-empty-state-image" name="no_data.svg" />
        <div className="bi-empty-state-header">
          You don't have any favorites
        </div>
      </div>
    );
  };

  const displayNoContentState = () => {
    return (
      <div className="bi-section-content--center">
        {error
          ? displayErrorState()
          : isEmptyState
          ? displayEmptyState()
          : displayLoadingState()}
      </div>
    );
  };

  const displayLoadedState = () => {
    return (
      <div className="bi-section-content bi-c-h">
        <div
          className="bi-panel bi-c-h bi-fade-in bi-theme--lighter"
          data-hook="favorites-content"
        >
          <div className="bi-panel-content bi-c-h">
            <Table
              rows={favorites}
              rowsConfig={favoritesTableFields(onLikeToggle)}
              onRowClicked={onFavoriteClick}
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
