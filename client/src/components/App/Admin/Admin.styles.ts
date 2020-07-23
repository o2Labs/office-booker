import styled from 'styled-components';

export default styled.div`
  > .redirect {
    > h2 {
      margin: 0 0 1.4rem;

      color: ${(props) => props.theme.palette.primary.main};
      font-size: 1.8rem;
      font-weight: 400;
    }

    > p {
      margin: 0 0 2rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 400;
    }
  }
`;
