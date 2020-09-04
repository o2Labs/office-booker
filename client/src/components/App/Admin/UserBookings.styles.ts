import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.only('xs')} {
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

  > h4 {
    margin: 0 0 1.6rem;

    color: ${(props) => props.theme.palette.secondary.main};
    font-size: 1.6rem;
    font-weight: 700;
  }

  > .table-container {
    /* margin-top: 2rem; */
    padding: 2rem 3rem 3rem;

    > h4 {
      margin: 0 0 1.6rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 700;
    }

    > .table {
      padding: 0 1.6rem 3rem;
      overflow: scroll;
    }

    .table-header {
      font-weight: 700;
    }
  }
`;
