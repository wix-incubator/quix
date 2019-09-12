import {IFile} from '@wix/quix-shared';

export const initTableFields = scope => {
  const fields = [];

  if (scope.permissions.edit) {
    fields.push({
      name: 'mark',
      title: ' ',
      sort: false,
      filter(_, file, index, compile) {
        return compile(`
          <span class="quix-checkbox" ng-click="$event.stopPropagation()" data-hook="files-mark-column">
            <i
              class="bi-action bi-icon bi-fade-in checked"
              ng-if="vm.marked.map[file.id]"
              ng-click="$event.stopPropagation(); events.onMarkToggle(file)"
            >
              check_box_outline
            </i>
            <i
              class="bi-action bi-icon bi-fade-in"
              ng-if="!vm.marked.map[file.id]"
              ng-click="$event.stopPropagation(); events.onMarkToggle(file)"
            >
              check_box_outline_blank
            </i>
          </span>  
        `, {file}, scope);
      }
    });
  }

  return [...fields, ...[{
    name: 'name',
    sort(_, file) {
      return `${file.type === 'folder' ? 0 : 1}${file.name}`;
    },
    filter(_, file: IFile, index, compile) {
      return compile(`
        <div class="bi-align bi-s-h">
          <i class="bi-icon bi-muted">{{::file.type === 'folder' ? 'folder' : 'insert_drive_file'}}</i>

          <span ng-if="!vm.get(file).isNew">{{::file.name}}</span>
          
          <span
            ng-if="vm.get(file).isNew"
            contenteditable="{{vm.get(file).isNew}}"
            ce-options="::{autoEdit: true}"
            ng-model="file.name"
            ng-blur="vm.get(file).isNew = false"
            on-change="events.onChildNameChange(file)"
          ></span>
        </div>
      `, {file, vm: scope.vm.files}, scope);
    }
  }, {
    name: 'dateCreated',
    filter(_, file: IFile, index, compile) {
      return compile(`
        <span class="bi-text--sm bi-muted">{{::file.dateCreated | biRelativeDate}}</span>
      `, {file}, scope);
    }
  }, {
    name: 'dateUpdated',
    filter(_, file: IFile, index, compile) {
      return compile(`
        <span class="bi-text--sm bi-muted">{{::file.dateUpdated | biRelativeDate}}</span>
      `, {file}, scope);
    }
  }
  // {
  //   name: 'liked',
  //   title: ' ',
  //   sort: false,
  //   filter(_, file: IFile, index, compile) {
  //     return compile(`
  //       <div class="bi-justify-right">
  //         <i 
  //           class="bi-action bi-icon--sm"
  //           ng-class="{'bi-danger': file.isLiked}"
  //           ng-click="$event.stopPropagation(); events.onLikeToggle(file)"
  //         >{{::file.isLiked ? 'favorite' :'favorite_border'}}</i>
  //       </div>
  //     `, {file}, scope);
  //   }
  // }
]];
};
