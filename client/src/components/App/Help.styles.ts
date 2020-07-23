import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2rem 2rem 2.4rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 3rem 3rem 4rem;
  }

  > h2 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 2.4rem;
    font-weight: 400;
  }

  > h3 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 1.8rem;
    font-weight: 500;
  }

  p {
    margin: 0 0 2rem;

    color: ${(props) => props.theme.palette.secondary.main};
    font-size: 1.6rem;
    font-weight: 400;

    > a {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }

  > ul {
    margin: 0;

    &:not(:last-child) {
      margin-bottom: 2.2rem;
    }

    > li {
      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 400;
    }
  }

  .change-office {
    display: flex;

    margin-bottom: 2rem;

    > p {
      flex: 0 0 auto;

      margin: 0;
      padding-right: 1rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 400;

      > span {
        color: ${(props) => props.theme.palette.primary.main};
        font-weight: 500;
      }
    }

    > button {
      flex: 0 0 auto;
      font-size: 1.6rem;
      font-weight: 700;
      vertical-align: inherit;
    }
  }
`;
