import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IHistory } from '@wix/quix-shared';
import { openTempQuery } from '../../services/popup';

export const onHistoryClick = (scope, store: Store, app: App) => (
  history: IHistory
) => {
  openTempQuery(
    scope,
    history.moduleType,
    history.query.join(';\n') + ';',
    false,
  );
};
