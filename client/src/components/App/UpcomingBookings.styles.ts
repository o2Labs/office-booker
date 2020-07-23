import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2rem 2rem 2.4rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 3rem 3rem 4rem;
  }

  > h2 {
    margin: 0;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 2.4rem;
    font-weight: 400;
  }

  > .previous-bookings .previous-booking-office {
    margin-left: 0.5em;
  }

  > .bookings {
    max-width: 40rem;

    ${(props) => props.theme.breakpoints.up('xs')} {
      padding: 1.2rem 1.8rem 1.8rem;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      padding: 1.2rem 2.8rem 2.8rem;
    }

    margin-top: 2.4rem;

    > .grid {
      margin-top: 1.8rem;

      > .row {
        display: flex;
        align-items: center;

        ${(props) => props.theme.breakpoints.up('xs')} {
          padding: 1.2rem 1.8rem;
        }

        ${(props) => props.theme.breakpoints.up('sm')} {
          padding: 1.6rem 2rem;
        }

        background: #f5f5f5;

        &:not(:first-of-type) {
          margin-top: 0.8rem;
        }

        > .left {
          flex: 1 1 50%;

          > .date {
            margin: 0;

            font-size: 1.6rem;
            font-weight: 300;
          }

          > .office {
            margin: 0;

            font-weight: bold;
            font-size: 1.3rem;
          }
        }

        > .right {
          flex: 1 1 50%;

          text-align: right;

          > button {
            font-size: 1.2rem;
            font-weight: bold;

            &.loading {
              color: ${(props) => props.theme.palette.text.disabled};
            }
          }
        }
      }
    }
  }

  > .button {
    margin-top: 3.6rem;
  }
`;
