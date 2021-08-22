
export interface IContextEvaluator {
  (input: string, position: number): any;
}

export interface IAutocompleter {
  getCompleters(query: string, position: number): any;
}

// export interface IEntities {
//   column: Column;
//   table: Table;
//   schema: Schema;
//   catalog: Catalog;
// }