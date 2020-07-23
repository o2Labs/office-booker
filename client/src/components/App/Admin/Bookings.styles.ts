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
`;
