import { RowConfig } from '../lib/ui/components/Table';

export interface HighlightedRowConfig<T> extends RowConfig<T> {
  filter?(
    value,
    item: T,
    index,
    highlight?: (string) => React.ReactNode
  ): React.ReactNode;
}