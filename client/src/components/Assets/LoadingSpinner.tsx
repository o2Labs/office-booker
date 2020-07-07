import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import LoadingSpinnerStyles from './LoadingSpinner.styles';

const LoadingSpinner: React.FC = () => (
  <LoadingSpinnerStyles>
    <CircularProgress />
  </LoadingSpinnerStyles>
);

export default LoadingSpinner;
