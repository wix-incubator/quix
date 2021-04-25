import {Testkit} from '../../../../../test/e2e/driver';

const enum Hooks {
  Initial = 'table-initial',
  Error = 'table-error',
  EmptyResult = 'table-empty-result',
  FilterInitial = 'table-filter-initial',
  TableRow = 'table-row',
}

export class TableTestkit extends Testkit {

  tableStates = {
    hasError: async () => {
      return (await this.query.hook(Hooks.Error)) !== null;
    },

    hasLoading: async () => {
      return (await this.query.hook(Hooks.Initial)) !== null;
    },

    hasFilterLoading: async () => {
      return (await this.query.hook(Hooks.FilterInitial)) !== null;
    },

    hasEmptyResult: async () => {
      return (await this.query.hook(Hooks.EmptyResult)) !== null;
    },
  }

  tableTotalRows = async () => {
    return (await this.query.hooks(Hooks.TableRow)).length;
  }
}
