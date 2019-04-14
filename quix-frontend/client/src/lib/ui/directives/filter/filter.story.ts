export default app => app
  .story('UI', 'Filter')
    .section('Filter', `
      <description>Allows to filter items of any directive which uses an array as input.</description>

      <bi-filter on-filter="filter(item, terms)" ng-non-bindable style="width: 400px;">
        <div class="bi-column bi-space-v">
          <bi-search bi-filter-term ng-model="text" bi-focus placeholder="Lets filter some tags"></bi-search>
          <bi-tags bi-filter-items bi-options="tag for tag in tags" bt-options="{freetext: true}" ng-model="tags"></bi-tags>
        </div>
      </bi-filter>
    `, scope => {
      scope.text = 'on';
      scope.tags = ['one', 'two', 'three'];

      scope.filter = (item, [term]) => {
        return item.indexOf(term) !== -1;
      };
    });
