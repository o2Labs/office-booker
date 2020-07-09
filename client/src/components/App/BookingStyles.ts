import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
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

    .btn-container {
      text-align: right;
    }
  }
`;
