import styled from 'styled-components';

export default styled.header`
  display: flex;
  align-items: center;

  background: linear-gradient(
    90deg,
    rgba(35, 147, 207, 1) 0%,
    rgba(35, 147, 207, 1) 20%,
    rgba(18, 122, 190, 1) 20%,
    rgba(18, 122, 190, 1) 40%,
    rgba(29, 99, 172, 1) 40%,
    rgba(29, 99, 172, 1) 60%,
    rgba(28, 74, 150, 1) 60%,
    rgba(28, 74, 150, 1) 80%,
    rgba(35, 36, 110, 1) 80%,
    rgba(35, 36, 110, 1) 100%
  );

  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 1.6rem 2rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 1.6rem 3rem;
  }

  > .app-icon {
    flex: 0 0 auto;

    > button > img {
      ${(props) => props.theme.breakpoints.up('xs')} {
        width: 2.4rem;
        height: 2.4rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        width: 3rem;
        height: 3rem;
      }
    }
  }

  > .title {
    flex: 1 1 auto;

    color: white;

    > h1 {
      margin: 0;
      padding: 0 2rem 0 1.5rem;

      > a {
        color: unset;
        text-decoration: none;
      }

      ${(props) => props.theme.breakpoints.up('xs')} {
        font-size: 2.2rem;
        line-height: 2.6rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        font-size: 2.8rem;
        line-height: 3.2rem;
      }
    }
  }

  > .lab-logo {
    flex: 0 0 auto;

    > a > img {
      ${(props) => props.theme.breakpoints.up('xs')} {
        width: 2.6rem;
        height: 2.6rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        width: 3.2rem;
        height: 3.2rem;
      }
    }
  }
`;
