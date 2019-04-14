import {srv} from '../../../core';

export class Controller extends srv.eventEmitter.EventEmitter {
  private readonly terms: Function[] = [];
  private items: any[];
  private filtered: any[];

  constructor(private readonly $scope) {
    super();
  }

  private getTerms() {
    return this.terms.map(term => term());
  }

  private reset() {
    this.filtered = this.items;
  }

  public setItems(items) {
    this.items = items;
    this.filter();
  }

  public addTerm(term: Function) {
    this.terms.push(term);
  }

  public filter() {
    const terms = this.getTerms();

    this.$scope.onChange();

    if (terms.every(term => !term)) {
      this.reset();
      this.$scope.onReset();
    } else {
      this.filtered = this.items && this.items.filter(item => this.$scope.onFilter({item, terms}));
    }

    this.fire('filtered', this.filtered);
  }
}

export default () => {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {
      onFilter: '&',
      onReset: '&',
      onChange: '&'
    },
    controller: ['$scope', Controller]
  };
};
