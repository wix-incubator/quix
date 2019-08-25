import React from 'react';
import { Subtract } from 'utility-types';
import {Store} from '../../store';
import {App} from '../../app';

const AppStoreContext = React.createContext<InjectedAppStoreProps>({
  app: null,
  store: null
});

export interface InjectedAppStoreProps {
    app:App,
    store: Store
}

export const withAppStoreProvider = <P extends {}>(app: App, store: Store, ComponentToWrap: React.ComponentType<P> ):React.FC<P> => 
(props) => <AppStoreContext.Provider value={{app, store}}>
  <ComponentToWrap {...props}/>
</AppStoreContext.Provider>

export const withAppStore = <P extends InjectedAppStoreProps>(
  ComponentToWrap: React.ComponentType<P>,
): React.ComponentType<Subtract<P, InjectedAppStoreProps>> => props => (
  <AppStoreContext.Consumer>
    {({ app, store }) => {
      const injectedProps = { ...props, app, store } as P;
      return <ComponentToWrap {...injectedProps} />;
    }}
  </AppStoreContext.Consumer>
);
