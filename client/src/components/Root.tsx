import React from 'react';
import { StylesProvider, ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import MaterialTheme from '../styles/MaterialTheme';
import StyledGlobal from '../styles/StyledGlobal';

import { AppProvider } from './AppProvider';

import Structure from './Structure';

const Root: React.FC = () => (
  <StylesProvider injectFirst>
    <StyledThemeProvider theme={MaterialTheme}>
      <MaterialThemeProvider theme={MaterialTheme}>
        <CssBaseline />
        <StyledGlobal />
        <AppProvider>
          <Structure />
        </AppProvider>
      </MaterialThemeProvider>
    </StyledThemeProvider>
  </StylesProvider>
);

export default Root;
