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
    margin: 0 0 2.2rem;

    color: ${(props) => props.theme.palette.secondary.main};
    font-size: 1.6rem;
    font-weight: 400;

    &.sub {
      margin-top: 2.2rem;

      font-size: 1.4rem;
    }

    > span {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }

  ul {
    margin: 2.2rem 0;
    padding: 0 0 0 2rem;

    > li {
      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.4rem;
      font-weight: 400;

      > span {
        color: ${(props) => props.theme.palette.primary.main};
      }
    }
  }
`;
