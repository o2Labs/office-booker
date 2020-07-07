import { createMuiTheme } from '@material-ui/core/styles';

import { BASE_FONT_SIZE } from '../constants/theme';

const MaterialTheme = createMuiTheme({
  typography: {
    // Adjust Material UI REM calculations to match
    // the font adjustments we use globally
    htmlFontSize: BASE_FONT_SIZE,
    fontFamily: ['Verdana', 'Arial'].join(','),
  },
  palette: {
    primary: {
      main: '#0019A5',
      dark: '#000066',
    },
    secondary: {
      main: '#0090D0',
      light: '#41B6E6',
    },
    background: {
      default: '#FFFFFF',
    },
  },
});

export default MaterialTheme;
