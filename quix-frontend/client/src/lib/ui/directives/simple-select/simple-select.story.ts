import {inject} from '../../../core';

export default app => app
  .story('UI', 'Select')
    .section('Select', `
      <bi-simple-select ng-non-bindable bi-options="option for option in ::['option 2', 'option 1', 'option 3']" ng-model="selected1">
      </bi-simple-select>
      <output>selected1: {{selected1 || 'Nothing selected'}}</output>

      <bi-simple-select ng-non-bindable bi-options="option.title for option in ::[{title: 'option 1'}, {title: 'option 2'}, {title: 'option 3'}]" ng-model="selected2"></bi-simple-select>
      <output>selected2: {{selected2 || 'Nothing selected'}}</output>

      <bi-simple-select ng-non-bindable bi-options="option.value as option.title for option in ::[{title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}]" ng-model="selected3"></bi-simple-select>
      <output>selected3: {{selected3 || 'Nothing selected'}}</output>

      <bi-simple-select ng-non-bindable bi-options="option.value as option.title for option in ::[{title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}]" ng-model="selected3" readonly="true"></bi-simple-select>
    `)
    .section('Typeahead', `
       <bi-simple-select
       bi-focus
        ng-non-bindable
        ng-model="typeahead"
        bi-options="option.value as option.title for option in ::[{title: 'Empty', value: ''}, {title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}]"
        bs-options="::{typeahead: true}"
      ></bi-simple-select>

      <bi-simple-select
        ng-non-bindable
        ng-model="typeaheadPromise"
        bi-options="option.value as option.title for option in promise"
        bs-options="::{typeahead: true}"
        on-search-change="onSearchChange(text)"
        placeholder="Promise based"
      ></bi-simple-select>
    `, scope => {
      scope.onSearchChange = () => scope.promise = inject('$timeout')(() => {
        return [{title: 'Empty', value: ''}, {title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}];
      }, 2000);
    })
    .section('Null item', `
      <bi-simple-select ng-non-bindable bi-options="option for option in ::[null, 'option 1', 'option 2', 'option 3']" ng-model="nullItem1"></bi-simple-select>
      <bi-simple-select ng-non-bindable bi-options="option.value as option.title for option in ::[{title: 'Empty', value: ''}, {title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}]" ng-model="nullItem2"></bi-simple-select>
  `)
    .section('Custom toggle', `
      <bi-simple-select ng-non-bindable bi-options="option.value as option.title for option in ::[{title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}]" ng-model="selected4">
        <toggle>
          {{item.formatted}}
        </toggle>
      </bi-simple-select>
      <output>selected: {{selected4 || 'Nothing selected'}}</output>
  `)
    .section('Custom items', `
      <bi-simple-select ng-non-bindable bi-options="option.value as option.title for option in ::[{title: 'option 1', value: 1}, {title: 'option 2', value: 2}, {title: 'option 3', value: 3}]" ng-model="selected4">
        <div>{{::item.value}}. {{::item.title}}</div>
      </bi-simple-select>
      <output>selected: {{selected4 || 'Nothing selected'}}</output>
  `);
