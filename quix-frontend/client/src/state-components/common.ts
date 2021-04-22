export interface RowConfig<T> {
  name: keyof T;
  title?: string;
  className?: string;
  filter?(value, item: T, index): React.ReactNode;
}

export interface HighlightedRowConfig<T> extends RowConfig<T> {
  filter?(
    value,
    item: T,
    index,
    highlight?: (string) => React.ReactNode
  ): React.ReactNode;
}