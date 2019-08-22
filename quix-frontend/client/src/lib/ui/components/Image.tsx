import * as React from 'react';
import {
  InjectedAppStoreProps,
  withAppStore
} from '../../app/services/appStoreProvider';

export interface ImageProps extends InjectedAppStoreProps {
  name: string;
  className?: string;
  dataHook?: string;
}
export const Image = withAppStore((props: ImageProps) => {
  const {name, className, dataHook, app} = props;
  const src = `${
    app.getConfig().getClientTopology().staticsBaseUrl
  }assets/${name}`;
  return <img src={src} className={className} data-hook={dataHook} />;
});
