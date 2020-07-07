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
`;

export const TabButton = styled(Button)<ButtonProps>`
  min-width: inherit;

  ${(props) => props.theme.breakpoints.up('xs')} {
    width: 12rem;
    line-height: 1.8rem;
    height: 5rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    width: 20rem;
  }

  border-radius: 1rem 1rem 0 0;
  box-shadow: none;
  border: 0;
  margin-right: 0.6rem;

  text-transform: inherit;
  font-weight: 400;
  color: #545454;

  background-color: #c3c3c3;

  :hover {
    background-color: white;
    color: #000000;

    box-shadow: 0 -0.2rem ${(props) => props.theme.palette.secondary.main} inset;
    transition: 0.36s ease-in;
  }

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
