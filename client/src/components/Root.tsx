import React from 'react';
import { StylesProvider, ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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

        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <AppProvider>
            <Structure />
          </AppProvider>
        </MuiPickersUtilsProvider>
      </MaterialThemeProvider>
    </StyledThemeProvider>
  </StylesProvider>
);

export default Root;
