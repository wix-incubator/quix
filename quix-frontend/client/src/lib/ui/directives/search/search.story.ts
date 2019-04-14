export default app => app
  .story('UI', 'Input')
    .section('Search input', `
      <bi-search ng-non-bindable ng-model="searchText" bi-focus placeholder="Search for something"></bi-search>
      <output>searchText: {{searchText}}</output>
    `)
    .section('Round search input', `
      <bi-search ng-non-bindable class="bi-search--rnd" ng-model="searchText" placeholder="Search for something"></bi-search>
      <output>searchText: {{searchText}}</output>
    `)
    .section('Borderless search input', `
      <bi-search ng-non-bindable class="bi-search--borderless" ng-model="searchText" placeholder="Search for something"></bi-search>
      <output>searchText: {{searchText}}</output>
    `)
    .section('Custom icons', `
      <bi-search
        ng-non-bindable
        ng-model="searchText"
        bs-options="::{searchIcon: 'filter_list', contextIcon: 'account_circle'}"
        placeholder="Search for something"
      ></bi-search>

      <bi-search
        ng-non-bindable
        class="bi-search--rnd"
        ng-model="searchText"
        bs-options="::{searchIcon: 'filter_list', contextIcon: 'account_circle'}"
        placeholder="Search for something"
      ></bi-search>

      <bi-search
        ng-non-bindable
        class="bi-search--borderless"
        ng-model="searchText"
        bs-options="::{searchIcon: 'filter_list', contextIcon: 'account_circle'}"
        placeholder="Search for something"
      ></bi-search>

      <output>searchText: {{searchText}}</output>
    `);
