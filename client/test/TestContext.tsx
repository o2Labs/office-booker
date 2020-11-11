import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { AppProvider } from '../src/components/AppProvider';
import { Config } from '../src/context/stores';
import MaterialTheme from '../src/styles/MaterialTheme';
import { User } from '../src/types/api';
import { StylesProvider, ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import Structure from '../src/components/Structure';

export const TestContext: React.FC<{ user?: User; config?: Config }> = ({
  children,
  user,
  config,
}) => (
  <StylesProvider injectFirst>
    <StyledThemeProvider theme={MaterialTheme}>
      <MaterialThemeProvider theme={MaterialTheme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <AppProvider initialState={{ user, config }}>
            <Structure>{children}</Structure>
          </AppProvider>
        </MuiPickersUtilsProvider>
      </MaterialThemeProvider>
    </StyledThemeProvider>
  </StylesProvider>
);
