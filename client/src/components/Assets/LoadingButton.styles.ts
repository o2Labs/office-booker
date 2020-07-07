import styled, { css } from 'styled-components';
import { ButtonProps } from '@material-ui/core';

interface Props {
  fullWidth?: boolean;
  size?: ButtonProps['size'];
  isLoading: boolean;
}

export default styled.div<Props>`
  position: relative;
  display: inline-block;

  ${(props) =>
    props.isLoading &&
    css`
      > button {
        opacity: 0.5;
      }
    `};

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  > .loading {
    position: absolute;

    top: 50%;
    left: 50%;

    ${(props) =>
      props.size && props.size === 'small'
        ? css`
            margin: -0.7rem 0 0 -0.7rem;
          `
        : css`
            margin: -1.2rem 0 0 -1.2rem;
          `}
  }
`;
