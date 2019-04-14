export default app => app
  .story('UI', 'Tabs')
    .section('Tabs', `
      <bi-tabs ng-non-bindable class="bi-grow" tabs="::[{name: 'one', icon: 'settings'}, {name: 'two'}, {name: 'three'}]">
        <div class="bi-panel--grey">
          <div class="bi-panel-content">
            <div ng-if="tabs.current === 'one'">Content of {{::tabs.current}}</div>
            <div ng-if="tabs.current === 'two'">Content of {{::tabs.current}}</div>
            <div ng-if="tabs.current === 'three'">Content of {{::tabs.current}}</div>
          </div>
        </div>
      </bi-tabs>

      <bi-tabs
        ng-non-bindable
        class="bi-grow"
        tabs="::[{name: 'one', icon: 'settings'}, {name: 'two'}, {name: 'three'}]"
        bt-current="current"
      >
        <div class="bi-panel--grey">
          <div class="bi-panel-content">
            <div ng-if="tabs.current === 'one'">Content of {{::tabs.current}}</div>
            <div ng-if="tabs.current === 'two'">Content of {{::tabs.current}}</div>
            <div ng-if="tabs.current === 'three'">Content of {{::tabs.current}}</div>
          </div>
        </div>
      </bi-tabs>

      <output>current: {{current}}</output>
    `, $scope => $scope.current = 'two')

    .section('Flat tabs', `
      <bi-tabs
        ng-non-bindable
        class="bi-grow"
        tabs="::[{name: 'one'}, {name: 'two'}, {name: 'three'}]"
        bt-options="::{mode: 'flat'}"
      >
        <div class="bi-panel">
          <div class="bi-panel-content">
            <div ng-if="tabs.current === 'one'">Content of {{::tabs.current}}</div>
            <div ng-if="tabs.current === 'two'">Content of {{::tabs.current}}</div>
            <div ng-if="tabs.current === 'three'">Content of {{::tabs.current}}</div>
          </div>
        </div>
      </bi-tabs>
    `);
