import React from 'react';
import { ButtonProps } from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { OurButton } from '../../styles/MaterialComponents';
import LoadingButtonStyles from './LoadingButton.styles';

type Props = {
  isLoading: boolean;
};

const LoadingButton: React.FC<ButtonProps & Props> = (props) => {
  // Extract "loading" from button props
  const { isLoading, ...buttonProps } = props;

  // Render
  return (
    <LoadingButtonStyles fullWidth={props.fullWidth} size={props.size} isLoading={isLoading}>
      <OurButton {...buttonProps}>{props.children}</OurButton>

      {isLoading && (
        <CircularProgress
          color={props.color !== 'default' ? props.color : undefined}
          size={props.size === 'small' ? '1.4rem' : '2.4rem'}
          className="loading"
        />
      )}
    </LoadingButtonStyles>
  );
};

export default LoadingButton;
