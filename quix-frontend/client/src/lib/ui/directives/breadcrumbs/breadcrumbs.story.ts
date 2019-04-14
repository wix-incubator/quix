export default app => app
  .story('UI', 'Breadcrumbs')
    .section('Breadcrumbs', `
      <bi-breadcrumbs ng-non-bindable bi-options="item as item.name for item in ::items" on-item-click="onItemClick(item)"></bi-breadcrumbs>
      <output>Selected: {{selected}}</output>
    `, scope => {
      scope.items = [{name: 'Foo'}, {name: 'Goo'}];
      scope.onItemClick = item => scope.selected = item;
    })
    .section('Custom breadcrumbs', `
      <bi-breadcrumbs ng-non-bindable bi-options="item as item.name for item in ::items" on-item-click="onItemClick(item)">
        <span class="bi-align bi-s-h--x05">
          <i class="bi-icon--sm bi-muted">face</i>
          <span>{{::item.name}}</span>
        </span>
      </bi-breadcrumbs>
      <output>Selected: {{selected}}</output>
    `);
