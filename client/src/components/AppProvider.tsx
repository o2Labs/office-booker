/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useReducer } from 'react';
import { AppStore, appInitialState } from '../context/stores';
import { appReducer } from '../context/reducers';

// Context provider
export const AppContext = createContext<AppStore>({
  state: appInitialState,
  dispatch: () => {},
});

export const AppProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(appReducer, appInitialState);

  return <AppContext.Provider value={{ state, dispatch }}>{props.children}</AppContext.Provider>;
};
