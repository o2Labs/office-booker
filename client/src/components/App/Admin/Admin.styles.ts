import styled from 'styled-components';

export default styled.div`
  h2 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 1.8rem;
    font-weight: 400;
  }

  h3 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 1.6rem;
    font-weight: 500;

    .check-box {
      padding: 0 1rem 0 0;
    }
  }

  .redirect {
    p {
      margin: 0 0 2rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 400;
    }
  }
`;
