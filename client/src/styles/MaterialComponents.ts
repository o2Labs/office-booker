import styled, { css } from 'styled-components';
import Button, { ButtonProps } from '@material-ui/core/Button';

export const OurButton = styled(Button)<ButtonProps>`
  min-width: inherit;

  border-radius: 0;
  box-shadow: none;

  ${(props) =>
    props.size === 'small'
      ? css`
          padding: 0.4rem 1.2rem;
          font-size: 1.3rem;
        `
      : css`
          padding: 0.8rem 4rem;
          font-size: 1.6rem;
        `}

  text-transform: inherit;
  font-weight: 400;

  svg {
    font-size: 2rem;
  }
`;

export const SubButton = styled(Button)`
  min-width: inherit;

  border-radius: 0.5rem;
  box-shadow: none;
  padding: 0.4rem 1.2rem;

  font-size: 1.3rem;
  text-transform: inherit;
  font-weight: 500;
`;
