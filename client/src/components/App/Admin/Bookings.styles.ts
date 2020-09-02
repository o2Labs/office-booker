import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 0 2rem 2rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 0 3rem 3rem;
  }

  > h3 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 1.8rem;
    font-weight: 500;
  }

  > .table-container {
    margin-top: 2rem;

    > .filter {
      display: flex;
      ${(props) => props.theme.breakpoints.only('xs')} {
        flex-wrap: wrap;
      }

      padding: 3rem 3rem 2rem;

      > .filter-office {
        ${(props) => props.theme.breakpoints.only('xs')} {
          flex: 1 1 auto;
        }

        ${(props) => props.theme.breakpoints.up('sm')} {
          flex: 0 0 auto;

          margin-right: 4rem;
        }
      }

      > .filter-date {
        ${(props) => props.theme.breakpoints.only('xs')} {
          flex: 1 1 auto;
          margin-top: 2rem;

          > .date-arrow {
            display: none;
          }

          > .date-picker {
            width: 100%;
          }
        }

        ${(props) => props.theme.breakpoints.up('sm')} {
          flex: 0 0 auto;
        }
      }

     > .total-bookings {
      > .bookings-count-label {
        transform: translate(0, 1.5px) scale(0.75);
        transform-origin: top left;
        font-size: 1.6rem;
      }

      > span {
        font-size: 1.6rem;
      }

      ${(props) => props.theme.breakpoints.only('xs')} {
        flex: 1 1 auto;
        margin-top: 2rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        flex: 0 0 auto;

        margin: 0 4rem 0 3rem;
      }
    }
    }

    /* .total-bookings {
      > .bookings-count-label {
        transform: translate(0, 1.5px) scale(0.75);
        transform-origin: top left;
        font-size: 1.6rem;
      }

      > span {
        font-size: 1.6rem;
      }

      ${(props) => props.theme.breakpoints.only('xs')} {
        flex: 1 1 auto;
        margin-top: 2rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        flex: 0 0 auto;

        margin: 0 4rem 0 2rem;
      }
    } */

    > .table {
      padding: 0 1.6rem 3rem;
      overflow: scroll;
    }

    .table-header {
      font-weight: 700;
    }
  }
`;
