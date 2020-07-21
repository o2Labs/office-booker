import styled, { css } from 'styled-components';
import { Status } from './BookingStatus';

type BookingStatusStylesProps = {
  office?: Status;
  parking?: Status;
};

const barWidth = 0.4;
const barMargin = 0.2;

export default styled.div<BookingStatusStylesProps>`
  display: flex;
  position: absolute;

  > section {
    display: flex;
    align-items: center;

    margin: 0 0.2rem;

    svg {
      margin-right: 0.2rem;
      font-size: 2rem;
    }

    > .bars {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      height: min-content;
      width: ${(barWidth + barMargin * 2) * 4}rem;

      background-color: #59efb0;

      position: relative;

      > .bar {
        width: ${barWidth}rem;
        height: 1rem;
        background-color: #000000de;
        margin: ${barMargin}rem;

        border-radius: 0.1rem;
      }
    }

    .office{
    ${(props) =>
      props.office === 'h' &&
      css`
        background-color: #59efb0;
      `}

      ${(props) =>
        props.office === 'm' &&
        css`
          background-color: #fff942;
        `}

      ${(props) =>
        props.office === 'l' &&
        css`
          background-color: #ff7790;
        `}

    }

    .parking{
    ${(props) =>
      props.parking === 'h' &&
      css`
        background-color: #59efb0;
      `}

      ${(props) =>
        props.parking === 'm' &&
        css`
          background-color: #fff942;
        `}

      ${(props) =>
        props.parking === 'l' &&
        css`
          background-color: #ff7790;
        `}

    }
  }
`;
