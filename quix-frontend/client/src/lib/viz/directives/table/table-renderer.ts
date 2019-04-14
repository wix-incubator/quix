import {inject} from '../../../core';
import {BufferedCollection} from '../../../core/srv/collections';

export class TableRenderer {
  constructor(private readonly container) {

  }

  public draw(scope, data: BufferedCollection, fields: string[], formatter) {
    const childScope = scope.$new();

    childScope.data = data;
    childScope.fields = fields;
    childScope.formatter = formatter;

    this.container.html(inject('$compile')(`
      <bi-tbl
        class="bi-table--data bi-c bi-grow"
        ng-if="data.bufferSize()"
        fields="::fields"
        collection="::data"
        formatter="formatter()"
        bt-options="::{dontTransformColumnNames: true, stickyHeader: true, infiniteScroll: true}"
      ></bi-tbl>

      <div class="bi-muted bi-center" ng-if="!data.bufferSize() && isPartial">
        <span class="bi-spinner"></span>
      </div>
      <div class="bi-muted" ng-if="!data.bufferSize() && !isPartial">No results</div>
    `)(childScope));
  }
}
