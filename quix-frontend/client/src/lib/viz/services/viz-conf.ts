export interface IInputItem {
  [key: string]: any;
}

export interface IRenderer<Meta, Data, FilterData> {
  error(e): any;
  draw(data: Data, meta: Meta, filteredMeta: Meta, filter: FilterData): void;
  destroy(): void;
}
