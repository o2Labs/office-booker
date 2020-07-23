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

      padding: 3rem 3rem 2rem;

      > .filter-office {
        flex: 0 0 auto;

        margin-right: 4rem;
      }

      > .filter-date {
        flex: 0 0 auto;
      }
    }

    > .table {
      padding: 0 1.6rem 3rem;
    }

    .table-header {
      font-weight: 700;
    }
  }

  /* ${(props) => props.theme.breakpoints.up('xs')} {
    margin: 0 2rem 2.4rem;
    .MuiPaper-root {
      padding: 2rem 2rem 2.4rem;
    }
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    margin: 0 3rem 4rem;
    .MuiPaper-root {
      padding: 3rem 3rem 4rem;
    }
  }

  margin: 0 3rem;

  .MuiPaper-root {
    padding: 3rem;
  }

  .select-container {
    margin-bottom: 3rem;
    display: flex;
    justify-content: space-between;

    .MuiSelect-select {
      min-width: 12rem;
    }
  }

  .listing-container {
    overflow: scroll;

    .MuiToolbar-root {
      display: flex;
      justify-content: space-between;

      .filters {
        display: flex;
        > :first-child {
          margin-right: 2rem;
        }

        .create-btn {
          margin-left: 2rem;
          text-transform: inherit;
        }
      }
    }
  } */
`;
