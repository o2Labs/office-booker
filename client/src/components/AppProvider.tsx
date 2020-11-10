/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useReducer } from 'react';
import { AppStore, appInitialState, AppState } from '../context/stores';
import { appReducer } from '../context/reducers';

// Context provider
export const AppContext = createContext<AppStore>({
  state: appInitialState,
  dispatch: () => {},
});

export const AppProvider: React.FC<{ initialState?: AppState }> = (props) => {
  const [state, dispatch] = useReducer(appReducer, props.initialState ?? appInitialState);

  return <AppContext.Provider value={{ state, dispatch }}>{props.children}</AppContext.Provider>;
};
