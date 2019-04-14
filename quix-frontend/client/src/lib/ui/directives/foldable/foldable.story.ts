export default app => app
  .story('UI', 'Foldable')
  .section('Simple fold', `
    <div class="bi-panel--grey bi-grow" ng-non-bindable bi-foldable is-folded="false">
      <div class="bi-panel-header" bf-toggle>
        <span class="bi-panel-title">bi-foldable</span>
        <div bf-controls></div>
      </div>
      <div class="bi-panel-content bi-space-v" ng-show="!bf.fold">
        <div class="bi-space-v">
          <div>
            Binding from outside can go here:
            {{outsideBinding}}
          </div>
          <div>
            fold status: {{bf.fold}}
          </div>
        </div>
      </div>
    </div>
  `, scope => {
    scope.outsideBinding = `I'm a bidning set from outside scope`;
  })
  .section('Fold with saved state', `
    <div class="bi-panel--grey bi-grow" bi-foldable ng-non-bindable is-folded="false" state-name="'someStateName'">
      <div class="bi-panel-header" bf-toggle>
        <span class="bi-panel-title">bi-foldable</span>
        <div bf-controls></div>
      </div>
      <div class="bi-panel-content bi-space-v" ng-show="!bf.fold">
        <div class="bi-space-v">
          <div>
            fold status: {{bf.fold}}
          </div>
        </div>
      </div>
    </div>
  `)
  .section('options.style = folder', `
    <div bi-foldable bf-options="::{style: 'folder'}" is-folded="true" ng-non-bindable>
      <div class="bi-align">
        <span bf-controls></span>
        <span bf-toggle>folder</span>
      </div>

      <div ng-if="!bf.fold">folder content</div>
    </div>
  `);
