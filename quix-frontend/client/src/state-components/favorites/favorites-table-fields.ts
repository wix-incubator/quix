import {IFile} from '../../../../shared';

export const initTableFields = scope => {
  return [{
    name: 'name',
    filter(_, file: IFile, index, compile) {
      return compile(`
        <div class="bi-align bi-s-h">
          <i class="bi-icon bi-muted">insert_drive_file</i>
          <span>{{::file.name}}</span>
        </div>
      `, {file}, scope);
    }
  // }, {
  //   name: 'path',
  //   filter(_, file: IFile, index, compile) {
  //     return compile(`
  //       <span class="bi-text--sm bi-muted">{{::path}}</span>
  //     `, {path: `/${file.path.slice(1).map(({name}) => name).join('/')}`}, scope);
  //   }
  }, {
    name: 'owner',
    filter(_, file: IFile, index, compile) {
      return compile(`
        <div class="bi-align bi-s-h">
        <img class="quix-user-avatar" ng-src="{{::file.ownerDetails.avatar}}"/>
          <span>{{::file.ownerDetails.name}}</span>
        </div>
      `, {file}, scope);
    }
  }, {
    name: 'liked',
    title: ' ',
    sort: false,
    filter(_, file: IFile, index, compile) {
      return compile(`
        <div class="bi-justify-right">
          <i 
            class="bi-action bi-icon--sm"
            ng-class="{'bi-danger': file.isLiked}"
            ng-click="$event.stopPropagation(); events.onLikeToggle(file)"
          >{{::file.isLiked ? 'favorite' :'favorite_border'}}</i>
        </div>
      `, {file}, scope);
    }
  }];
};
