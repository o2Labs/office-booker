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
    > .filters {
      display: flex;

      ${(props) => props.theme.breakpoints.only('xs')} {
        flex-direction: column;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        align-items: center;
        justify-content: space-between;
      }

      padding: 3rem 3rem 2rem;

      > .filter-roles {
        flex: 0 0 auto;
      }

      > .search-user {
        flex: 0 0 auto;

        ${(props) => props.theme.breakpoints.only('xs')} {
          padding-top: 2rem;
        }
      }
    }

    > .table {
      padding: 0 1.6rem 3rem;
      overflow: scroll;
    }
  }

  > .load-more-container {
    padding: 0 3rem 3rem;

    text-align: center;
  }

  > .unregistered-user {
    padding: 0 3rem 3rem;

    > p {
      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 400;

      margin: 0;

      > a {
        color: ${(props) => props.theme.palette.primary.main};
      }
    }
  }
`;
