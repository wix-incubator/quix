export default app => app
.story('UI', 'Editable')
  .section('Editable', `
    <bi-editable ng-non-bindable ng-model="model">
      <div class="bi-align bi-space-h">
        <input class="bi-input" ng-disabled="!be.edit" ng-model="be.value">
        <div be-controls></div>
      </div>
    </bi-editable>

    <output>{{model}}</output>
  `, scope => scope.model = 'edit me')
  .section('options.mode=edit', `
    <bi-editable ng-non-bindable ng-model="model" be-options="::{mode: 'edit'}">
      <div class="bi-align bi-space-h">
        <input class="bi-input" ng-disabled="!be.edit" ng-model="be.value">
        <div be-controls></div>
      </div>
    </bi-editable>
`)
  .section('Custom controls', `
    <bi-editable ng-non-bindable ng-model="model">
      <div class="bi-align bi-space-h">
        <input class="bi-input" ng-disabled="!be.edit" ng-model="be.value">
        <div be-controls>
          <i class="bi-action--rnd bi-icon--xs">add</i>
        </div>
      </div>
    </bi-editable>
`);
