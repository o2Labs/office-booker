import styled from 'styled-components';

export default styled.div`
  padding: 3rem 3rem 4rem;

  > h2 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 2.4rem;
    font-weight: 400;
  }

  p {
    margin: 0;

    &:not(:last-child) {
      margin-bottom: 2.2rem;
    }

    color: ${(props) => props.theme.palette.secondary.main};
    font-size: 1.6rem;
    font-weight: 400;
  }

  > .buttons {
    > button {
      display: block;

      &:not(:first-child) {
        margin-top: 1rem;
      }
    }
  }
`;
