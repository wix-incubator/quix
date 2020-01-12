import { IHistory } from '@wix/quix-shared';
import biRelativeDate from '../../lib/ui/filters/relative-date';
import * as React from 'react';
import { RowConfig } from '../../lib/ui/components/Table';

interface HighlightedRowConfig<T> extends RowConfig<T> {
  filter?(
    value,
    item: T,
    index,
    highlight?: (string) => React.ReactNode
  ): React.ReactNode;
}

export const historyTableFields: HighlightedRowConfig<IHistory>[] = [
  {
    name: 'email',
    title: 'Email',
    filter(_, history: IHistory, index, highlight) {
      return <span>{highlight(history.email)}</span>;
    }
  },
  {
    name: 'query',
    title: 'Query',
    filter(_, history: IHistory, index, highlight) {
      const hasQuery = history.query.length > 0;
      const fullQuery = hasQuery ? history.query.join(';\n') + ';' : '';

      return <pre title={fullQuery}>{highlight(fullQuery)}</pre>;
    }
  },
  {
    name: 'moduleType',
    title: 'Note Type',
    filter(_, history: IHistory, index, highlight) {
      return (
        <span className='bi-muted'>
          {highlight(history.moduleType)}
        </span>
      );
    }
  },
  {
    name: 'startedAt',
    title: 'Started At',
    filter(_, history: IHistory, index) {
      return (
        <span className='bi-text--sm bi-muted'>
          {biRelativeDate()(history.startedAt as any)}
        </span>
      );
    }
  }
];
