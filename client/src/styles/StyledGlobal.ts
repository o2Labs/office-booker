import { createGlobalStyle } from 'styled-components';

import { BASE_FONT_SIZE } from '../constants/theme';

/*
  ----- GLOBAL STYLES -----
*/
const StyledGlobal = createGlobalStyle`
  /*
  PLEASE NOTE:

  Material UI CSSBaseline is included in /src/index.tsx to set default styles
  https://material-ui.com/components/css-baseline/

  This is similar to normalize, use /src/styles/MaterialTheme.ts to override:
  https://material-ui.com/customization/themes/
  */

  /* ---- BASE ---- */
  html {
    /*
    Font size based on 10px simplification
    https://www.sitepoint.com/understanding-and-using-rem-units-in-css/

    10px is a much easier base value to work out rem values, e.g.
      34px = 3.4rem

    PLEASE NOTE:
    This same value is used in /src/styles/MaterialTheme.ts to apply the
    same effect to Material UI components
    */
    font-size: ${BASE_FONT_SIZE}px;
  }
`;

export default StyledGlobal;
