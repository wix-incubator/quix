import {inject} from '../../../core';

export default app => app
  .story('UI', 'Focus')
    .section('Focus', `
      <input class="bi-input" bi-focus placeholder="I should be focused" ng-non-bindable/>
    `)
    .section('Focus If', `
      <bi-simple-select ng-model="data" bi-options="item for item in ::[1, 2]" ng-non-bindable/>
      <input class="bi-input" bi-focus-if="data" placeholder="I should be focused when selectbox is populated" ng-non-bindable/>
    `)
   ;
