import { BufferedCollection } from "../../../core/dist/src/srv/collections";

export default app => app
  .story('UI', 'Table')
  .section('Simple table', `
    <bi-tbl
      ng-non-bindable
      fields="::fields"
      rows="rows"
      bt-options="{trackBy: 'colA'}"
      order-by="colB"
      filter="filter"
      reverse="true"
    >
    </bi-tbl>
  `, scope => {
    scope.fields = ['colA', 'colB', 'colC'];
    scope.rows = [{
      colA: 1,
      colB: 2,
      colC: 3
    },
    {
      colA: 4,
      colB: 5,
      colC: 6
    }];

    scope.filter = (row) => {
      return true;
    };

    scope.emptyFilter = (row) => {
      return false;
    };
  })
  .section('Nav table', `
    <bi-tbl
      ng-non-bindable
      class="bi-table--nav"
      fields="::fields"
      rows="rows"
    ></bi-tbl>
  `)
  .section('Data table', `
    <bi-tbl
      ng-non-bindable
      class="bi-table--data"
      fields="::fields"
      rows="rows"
      bt-options="::{stickyHeader: true, trackBy: 'colA'}"
      order-by="colA"
    ></bi-tbl>
  `)
  .section('Data table with infinite scroll', `
    <bi-tbl
      ng-non-bindable
      class="bi-table--data"
      style="width: 100px; height: 110px;"
      fields="::fields"
      rows="::items"
      bt-options="::{stickyHeader: true, infiniteScroll: true, trackBy: 'colA', chunkSize: 3}"
      order-by="colA"
    ></bi-tbl>
  `, scope => {
    scope.items = '123456'.split('').map((num, index) => ({colA: num + index, colB: num + index + 1, colC: num + index + 2}));
  })
  .section('Empty table', `
    <bi-tbl
      ng-non-bindable
      fields="::fields"
      rows="::rows"
      filter="emptyFilter"
      empty-state-msg="No rows"
    ></bi-tbl>
  `);
