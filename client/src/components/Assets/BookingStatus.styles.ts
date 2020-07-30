import styled, { css } from 'styled-components';
import { Status } from './BookingStatus';

type BookingStatusStylesProps = {
  officeLeft?: number;
  officeStatus?: Status;
  parkingLeft?: number;
  parkingStatus?: Status;
};

export default styled.div<BookingStatusStylesProps>`
  display: flex;

  height: 100%;

  > section {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    &:not(:first-of-type) {
      margin-left: 1rem;
    }

    > svg {
        margin-right: 0.2rem;
        font-size: 2rem;

        color: #5f5f5f;
    }

    > .bars {
        height: 2rem;
        width: 0.8rem;

        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        background: lightgray;

        padding: 2px;

      > .bar {
        flex: 0 0 100%;
      }
    }

    .bars .office {
      flex: 0 0 ${(props) => props.officeLeft}%;

      ${(props) =>
        props.officeStatus === 'h' &&
        css`
          background-color: #59efb0;
        `}

      ${(props) =>
        props.officeStatus === 'm' &&
        css`
          background-color: #fff942;
        `}

      ${(props) =>
        props.officeStatus === 'l' &&
        css`
          background-color: #ff7790;
        `}
    }

    .bars .parking{
     flex: 0 0 ${(props) => props.parkingLeft}%;

      ${(props) =>
        props.parkingStatus === 'h' &&
        css`
          background-color: #59efb0;
        `}

      ${(props) =>
        props.parkingStatus === 'm' &&
        css`
          background-color: #fff942;
        `}

      ${(props) =>
        props.parkingStatus === 'l' &&
        css`
          background-color: #ff7790;
        `}
    }
  }
`;
