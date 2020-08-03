/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useReducer } from 'react';
import { AppStore } from '../context/stores';
import { appReducer } from '../context/reducers';

// Context provider
export const AppContext = createContext<AppStore>({
  state: {},
  dispatch: () => {},
});

export const AppProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(appReducer, {});

  return <AppContext.Provider value={{ state, dispatch }}>{props.children}</AppContext.Provider>;
};
