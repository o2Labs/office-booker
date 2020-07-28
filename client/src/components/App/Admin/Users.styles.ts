import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 0 2rem 2rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 0 3rem 3rem;
  }

  > h3 {
    margin: 0 0 2rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 1.8rem;
    font-weight: 500;
  }

  > .table-container {
    margin-top: 2rem;

    > .filters {
      display: flex;

      ${(props) => props.theme.breakpoints.only('xs')} {
        flex-direction: column;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        align-items: flex-end;
        justify-content: space-between;
      }

      padding: 3rem 3rem 2rem;

      > .filter-role {
        flex: 0 0 auto;
      }

      > .search-user {
        flex: 0 0 auto;

        ${(props) => props.theme.breakpoints.only('xs')} {
          padding-top: 2rem;
        }
      }
    }

    > p.note {
      margin: 0 3rem 2rem;

      font-size: 1.4rem;
      font-style: italic;
    }

    > .table {
      padding: 0 1.6rem 3rem;
      overflow: scroll;
    }

    .table-header {
      font-weight: 700;
    }

    > .load-more-container {
      padding: 0 3rem 3rem;

      text-align: center;
    }

    > .unregistered-user {
      padding: 0 3rem 3rem;

      > p {
        margin: 2rem 0 0;

        font-size: 1.4rem;
        font-weight: 400;
        font-style: italic;
      }

      > .link {
        display: flex;
        align-items: center;

        > p {
          flex: 0 1 auto;

          padding-right: 2rem;

          color: ${(props) => props.theme.palette.secondary.main};
          font-size: 1.6rem;
          font-weight: 400;

          margin: 0;

          > span {
            color: ${(props) => props.theme.palette.primary.main};
          }
        }

        > button {
          flex: 0 0 auto;
        }
      }
    }
  }
`;
